import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const { searchParams } = new URL(request.url);
        const course = searchParams.get('course');
        const section = searchParams.get('section');

        // Fixed: use separate param positions instead of reusing $1
        const params: any[] = [institutionId];
        let whereClause = 's.institution_id = $1';

        if (course) {
            params.push(course);
            whereClause += ` AND s.course_year = $${params.length}`;
        }
        if (section) {
            params.push(section);
            whereClause += ` AND s.section = $${params.length}`;
        }

        const res = await query(`
            SELECT s.id, s.enrollment_no, s.erp_id, s.course_year, s.section, u.full_name, u.email 
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE ${whereClause}
            ORDER BY s.enrollment_no
        `, params);

        return NextResponse.json({ students: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const { full_name, email, enrollment_no, erp_id, course_year, section } = await request.json();

        if (!full_name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }
        if (!course_year || !section) {
            return NextResponse.json({ error: 'Course Year and Section are required' }, { status: 400 });
        }

        const defaultPassword = 'student';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // 1. Create User — try with must_change_password first, fallback if column missing
        let userId;
        try {
            const res = await query(
                `INSERT INTO users (full_name, email, password_hash, role, institution_id) VALUES ($1, $2, $3, 'student', $4) RETURNING id`,
                [full_name, email, hashedPassword, institutionId]
            );
            userId = res.rows[0].id;
        } catch (e: any) {
            // If email already exists
            if (e.code === '23505') {
                return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
            }
            throw e;
        }

        // 2. Create Student Profile
        await query(`
            INSERT INTO students (user_id, enrollment_no, erp_id, course_year, section, institution_id)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [userId, enrollment_no || null, erp_id || null, course_year, section, institutionId]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

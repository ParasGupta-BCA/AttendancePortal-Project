import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const res = await query(`
            SELECT f.id, f.designation, f.department, u.full_name, u.email 
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            WHERE f.institution_id = $1
            ORDER BY u.full_name
        `, [institutionId]);
        return NextResponse.json({ faculty: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const { full_name, email, designation, employee_id } = await req.json();

        if (!full_name || !email || !designation) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const defaultPassword = "faculty";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Auto-generate employee_id if not provided
        const finalEmployeeId = employee_id || `EMP-${Date.now()}`;

        // 1. Check if user already exists (same email + institution)
        let userId;
        const existingUser = await query(
            `SELECT id FROM users WHERE email = $1 AND institution_id = $2`,
            [email, institutionId]
        );

        if (existingUser.rows.length > 0) {
            // Reuse existing user instead of failing
            userId = existingUser.rows[0].id;
        } else {
            // Create new user
            const userRes = await query(
                `INSERT INTO users (full_name, email, password_hash, role, institution_id) VALUES ($1, $2, $3, 'faculty', $4) RETURNING id`,
                [full_name, email, hashedPassword, institutionId]
            );
            userId = userRes.rows[0].id;
        }

        // 2. Check if already a faculty member (avoid duplicates)
        const existingFaculty = await query(
            `SELECT id FROM faculty WHERE user_id = $1 AND institution_id = $2`,
            [userId, institutionId]
        );
        if (existingFaculty.rows.length > 0) {
            return NextResponse.json({ error: 'This person is already a faculty member' }, { status: 409 });
        }

        // 3. Create Faculty Profile (include employee_id — required NOT NULL in Supabase)
        await query(
            `INSERT INTO faculty (user_id, designation, employee_id, institution_id) VALUES ($1, $2, $3, $4)`,
            [userId, designation, finalEmployeeId, institutionId]
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

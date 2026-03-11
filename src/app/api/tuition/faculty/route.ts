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

        const { full_name, email, designation } = await req.json();

        if (!full_name || !email || !designation) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Default password for new faculty
        // They will be forced to change it on first login
        const defaultPassword = "faculty";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // 1. Create User
        // Note: In a real app, use a transaction (BEGIN...COMMIT)
        let userId;
        try {
            const userRes = await query(
                `INSERT INTO users (full_name, email, password_hash, role, must_change_password, institution_id) VALUES ($1, $2, $3, 'faculty', TRUE, $4) RETURNING id`,
                [full_name, email, hashedPassword, institutionId]
            );
            userId = userRes.rows[0].id;
        } catch (e: any) {
            if (e.code === '42703' || e.message?.includes('must_change_password')) {
                await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE');
                const userRes = await query(
                    `INSERT INTO users (full_name, email, password_hash, role, must_change_password, institution_id) VALUES ($1, $2, $3, 'faculty', TRUE, $4) RETURNING id`,
                    [full_name, email, hashedPassword, institutionId]
                );
                userId = userRes.rows[0].id;
            } else {
                throw e;
            }
        }

        // 2. Create Faculty Profile
        await query(
            `INSERT INTO faculty (user_id, designation, institution_id) VALUES ($1, $2, $3)`,
            [userId, designation, institutionId]
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const res = await query(`
      SELECT f.id, f.designation, f.department, u.full_name, u.email 
      FROM faculty f
      JOIN users u ON f.user_id = u.id
      ORDER BY u.full_name
    `);
        return NextResponse.json({ faculty: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// ... existing GET ...

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { full_name, email, password, designation } = body;

        if (!full_name || !email || !password || !designation) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create User
        // Note: In a real app, use a transaction (BEGIN...COMMIT)
        const userRes = await query(
            `INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, 'faculty') RETURNING id`,
            [full_name, email, hashedPassword]
        );
        const userId = userRes.rows[0].id;

        // 2. Create Faculty Profile
        await query(
            `INSERT INTO faculty (user_id, designation) VALUES ($1, $2)`,
            [userId, designation]
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

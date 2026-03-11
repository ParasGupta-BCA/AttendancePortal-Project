import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { institution_name, admin_name, admin_email, admin_password, address } = await req.json();

        if (!institution_name || !admin_name || !admin_email || !admin_password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (admin_password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Generate a slug from institution name (e.g. "My Tuition Center" → "my-tuition-center")
        const slug = institution_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now();

        // 1. Check if an institution with the same slug/name already exists
        const existing = await query(
            `SELECT id FROM institutions WHERE name ILIKE $1`,
            [institution_name]
        );
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'An institution with this name already exists' }, { status: 409 });
        }

        // 2. Check if email already exists (as any user)
        const existingEmail = await query(
            `SELECT id FROM users WHERE email = $1`,
            [admin_email]
        );
        if (existingEmail.rows.length > 0) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        // 3. Create institution first
        const institutionRes = await query(
            `INSERT INTO institutions (name, slug, address, timezone, settings)
             VALUES ($1, $2, $3, 'Asia/Kolkata', '{}')
             RETURNING id`,
            [institution_name, slug, address || null]
        );
        const institutionId = institutionRes.rows[0].id;

        // 4. Hash password and create admin user
        const hashedPassword = await bcrypt.hash(admin_password, 12);
        await query(
            `INSERT INTO users (full_name, email, password_hash, role, institution_id, is_tuition_user)
             VALUES ($1, $2, $3, 'admin', $4, true)`,
            [admin_name, admin_email, hashedPassword, institutionId]
        );

        return NextResponse.json({ success: true, message: 'Institution created successfully! You can now log in.' });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create institution' }, { status: 500 });
    }
}

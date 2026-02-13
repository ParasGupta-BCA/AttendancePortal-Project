import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT * FROM classes ORDER BY name, section');
        return NextResponse.json(result.rows);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { course_year, section } = await req.json();
        if (!course_year || !section) return NextResponse.json({ message: 'Course and Section are required' }, { status: 400 });

        // Check if exists
        const existing = await query('SELECT * FROM classes WHERE name = $1 AND section = $2', [course_year, section]);
        if (existing.rows.length > 0) {
            return NextResponse.json({ message: 'Class already exists' }, { status: 409 });
        }

        const result = await query(
            'INSERT INTO classes (name, section) VALUES ($1, $2) RETURNING *',
            [course_year, section]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 });

        await query('DELETE FROM classes WHERE id = $1', [id]);
        return NextResponse.json({ message: 'Class deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

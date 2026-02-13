
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT * FROM courses ORDER BY name ASC');
        return NextResponse.json(result.rows);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

        const result = await query(
            'INSERT INTO courses (name) VALUES ($1) RETURNING *',
            [name]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        if (error.code === '23505') {
            return NextResponse.json({ message: 'Course already exists' }, { status: 409 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 });

        await query('DELETE FROM courses WHERE id = $1', [id]);
        return NextResponse.json({ message: 'Course deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

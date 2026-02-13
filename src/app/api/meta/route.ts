
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Fetch courses and sections in parallel
        const [coursesRes, sectionsRes] = await Promise.all([
            query('SELECT * FROM courses ORDER BY name ASC'),
            query('SELECT * FROM sections ORDER BY name ASC') // You might want custom ordering later
        ]);

        return NextResponse.json({
            courses: coursesRes.rows,
            sections: sectionsRes.rows
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ADD Timetable Slot
// Supabase timetable schema: id, subject_id, faculty_id, day_of_week, start_time, end_time, room_no, course_year, section, institution_id
// NO class_id, NO is_active columns exist in Supabase schema
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const body = await request.json();
        const { course_year, section, subject_id, faculty_id, day_of_week, start_time, end_time, room_no } = body;

        if (!subject_id || !day_of_week || !start_time || !end_time || !course_year || !section) {
            return NextResponse.json({ error: 'Missing required fields (subject_id, day_of_week, start_time, end_time, course_year, section)' }, { status: 400 });
        }

        const res = await query(`
            INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room_no, course_year, section, institution_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `, [subject_id, faculty_id || null, day_of_week, start_time, end_time, room_no || null, course_year, section, institutionId]);

        return NextResponse.json({ success: true, id: res.rows[0].id });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// UPDATE Timetable Slot
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const body = await request.json();
        const { id, course_year, section, subject_id, faculty_id, day_of_week, start_time, end_time, room_no } = body;

        if (!id || !subject_id || !day_of_week || !start_time || !end_time || !course_year || !section) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await query(`
            UPDATE timetable
            SET subject_id = $1, faculty_id = $2, day_of_week = $3, start_time = $4, end_time = $5, room_no = $6, course_year = $7, section = $8
            WHERE id = $9 AND institution_id = $10
        `, [subject_id, faculty_id || null, day_of_week, start_time, end_time, room_no || null, course_year, section, id, institutionId]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE Timetable Slot (Hard delete since no is_active column)
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        // Hard delete (Supabase timetable has no is_active column)
        await query(`DELETE FROM timetable WHERE id = $1 AND institution_id = $2`, [id, institutionId]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

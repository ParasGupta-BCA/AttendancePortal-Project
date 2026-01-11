import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ADD Timetable Slot
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { class_id, subject_id, faculty_id, day_of_week, start_time, end_time, room_no } = body;

        // Validation
        if (!class_id || !subject_id || !day_of_week || !start_time || !end_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Logic: Insert new slot. (We could check for conflicts here, but basic insert first)
        const res = await query(`
            INSERT INTO timetable (class_id, subject_id, faculty_id, day_of_week, start_time, end_time, room_no, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
            RETURNING id
        `, [class_id, subject_id, faculty_id || null, day_of_week, start_time, end_time, room_no]);

        return NextResponse.json({ success: true, id: res.rows[0].id });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


// UPDATE Timetable Slot
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, class_id, subject_id, faculty_id, day_of_week, start_time, end_time, room_no } = body;

        if (!id || !class_id || !subject_id || !day_of_week || !start_time || !end_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await query(`
            UPDATE timetable
            SET class_id = $1, subject_id = $2, faculty_id = $3, day_of_week = $4, start_time = $5, end_time = $6, room_no = $7
            WHERE id = $8
        `, [class_id, subject_id, faculty_id || null, day_of_week, start_time, end_time, room_no, id]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE Timetable Slot (Soft Delete)
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        // SOFT DELETE: Set is_active = FALSE
        await query(`UPDATE timetable SET is_active = FALSE WHERE id = $1`, [id]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

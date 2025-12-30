import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'faculty') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // 1. Get Faculty ID
        const facultyRes = await query('SELECT id, designation FROM faculty WHERE user_id = $1', [userId]);
        // Note: If admin is testing as faculty role but has no faculty profile, this might fail.
        // Handling graceful degradation or assuming profile exists.
        let facultyId = null;
        if ((facultyRes.rowCount ?? 0) > 0) {
            facultyId = facultyRes.rows[0].id;
        } else {
            // Fallback for demo users who might not have profile
            return NextResponse.json({
                stats: { classesToday: 0, studentsPresent: 0 },
                todaySchedule: [],
                error: "Faculty profile not found"
            });
        }

        // 2. Fetch Today's Classes for this Faculty
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];

        const scheduleRes = await query(`
      SELECT t.id, t.start_time, t.end_time, t.room_no, s.name as subject_name, c.name as class_name, c.section
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN classes c ON t.class_id = c.id
      WHERE t.faculty_id = $1
      AND t.day_of_week = $2
      ORDER BY t.start_time ASC
    `, [facultyId, todayName]);

        const todaySchedule = await Promise.all(scheduleRes.rows.map(async (slot) => {
            // Check active session
            const sessionRes = await query(`
            SELECT id, qr_code FROM attendance_sessions 
            WHERE timetable_id = $1 
            AND is_active = TRUE 
            AND end_time > NOW()
        `, [slot.id]);

            return {
                ...slot,
                activeSession: sessionRes.rows[0] || null // Return session details if active
            };
        }));

        // 3. Stats: classes taken today, total students marked present today in MY classes
        const todayStatsRes = await query(`
        SELECT COUNT(*) as present_count
        FROM attendance_records ar
        JOIN attendance_sessions s ON ar.session_id = s.id
        WHERE s.faculty_id = $1
        AND ar.marked_at::date = CURRENT_DATE
        AND ar.status = 'Present'
    `, [facultyId]);

        // 4. Global Analysis: Total Present vs Total Absent across ALL sesions
        // A. Total Actual Present
        const globalPresentRes = await query(`
            SELECT COUNT(*) as total_present
            FROM attendance_records ar
            JOIN attendance_sessions s ON ar.session_id = s.id
            WHERE s.faculty_id = $1
            AND ar.status = 'Present'
        `, [facultyId]);
        const totalPresent = parseInt(globalPresentRes.rows[0].total_present || '0');

        // B. Total Expected (Sum of class size for every session held)
        // Logic: For every session this faculty created, how many students were in that class?
        const globalExpectedRes = await query(`
            WITH ClassCounts AS (
                SELECT c.id as class_id, COUNT(s.id) as student_count
                FROM classes c
                JOIN students s ON c.name = s.course_year AND c.section = s.section
                GROUP BY c.id
            )
            SELECT SUM(cc.student_count) as total_expected
            FROM attendance_sessions s
            JOIN timetable t ON s.timetable_id = t.id
            JOIN ClassCounts cc ON t.class_id = cc.class_id
            WHERE s.faculty_id = $1
        `, [facultyId]);

        const totalExpected = parseInt(globalExpectedRes.rows[0].total_expected || '0');
        const totalAbsent = Math.max(0, totalExpected - totalPresent);

        return NextResponse.json({
            stats: {
                classesToday: todaySchedule.length,
                studentsPresent: parseInt(todayStatsRes.rows[0].present_count),
            },
            analysis: {
                totalPresent,
                totalAbsent
            },
            todaySchedule
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

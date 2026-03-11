import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        // 1. Total Students
        const studentCountRes = await query('SELECT COUNT(*) FROM students WHERE institution_id = $1', [institutionId]);
        const totalStudents = parseInt(studentCountRes.rows[0].count);

        // 2. Present Today
        const presentTodayRes = await query(`
            SELECT COUNT(DISTINCT student_id) 
            FROM attendance_records 
            WHERE status = 'Present' 
            AND marked_at::date = CURRENT_DATE 
            AND institution_id = $1
        `, [institutionId]);
        const presentToday = parseInt(presentTodayRes.rows[0].count);

        // 3. Absent Today
        const absentToday = totalStudents - presentToday;

        // 4. Monthly Attendance Rate
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        const monthStatsRes = await query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'Present') as present,
                COUNT(*) as total
            FROM attendance_records
            WHERE marked_at >= $1 AND institution_id = $2
        `, [currentMonthStart, institutionId]);

        const monthPresent = parseInt(monthStatsRes.rows[0].present);
        const monthTotal = parseInt(monthStatsRes.rows[0].total);
        const monthlyRate = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0;

        // 5. Recent Activity (Last 5 records)
        const recentActivityRes = await query(`
            SELECT ar.marked_at, s.enrollment_no, sub.code as subject_code
            FROM attendance_records ar
            JOIN students s ON ar.student_id = s.id
            JOIN attendance_sessions as_sess ON ar.session_id = as_sess.id
            JOIN timetable t ON as_sess.timetable_id = t.id
            JOIN subjects sub ON t.subject_id = sub.id
            WHERE ar.institution_id = $1
            ORDER BY ar.marked_at DESC
            LIMIT 5
        `, [institutionId]);
        const recentActivity = recentActivityRes.rows;

        // 6. Chart Data (Last 7 Days)
        const chartRes = await query(`
            SELECT 
                to_char(marked_at, 'Dy') as name,
                COUNT(*) FILTER (WHERE status = 'Present') as present,
                COUNT(*) FILTER (WHERE status = 'Absent') as absent
            FROM attendance_records
            WHERE marked_at > CURRENT_DATE - INTERVAL '7 days' AND institution_id = $1
            GROUP BY 1, marked_at::date
            ORDER BY marked_at::date
        `, [institutionId]);

        const chartData = chartRes.rows.map(row => ({
            name: row.name,
            present: parseInt(row.present),
            absent: parseInt(row.absent)
        }));

        // 7. Active Sessions — Supabase has no class_id/classes table.
        // timetable has course_year + section instead.
        const activeSessionsRes = await query(`
            SELECT 
                asess.id, asess.qr_code,
                sub.name as subject_name,
                t.course_year as class_name,
                t.section,
                u.full_name as faculty_name
            FROM attendance_sessions asess
            JOIN timetable t ON asess.timetable_id = t.id
            JOIN subjects sub ON t.subject_id = sub.id
            LEFT JOIN faculty f ON t.faculty_id = f.id
            LEFT JOIN users u ON f.user_id = u.id
            WHERE asess.is_active = TRUE AND asess.institution_id = $1
            ORDER BY asess.actual_start_time DESC
        `, [institutionId]);
        const activeSessions = activeSessionsRes.rows;

        // 8. Subject Performance
        const subjectStatsRes = await query(`
            SELECT 
                sub.name as subject,
                COUNT(ar.id) FILTER (WHERE ar.status = 'Present') as present_count,
                COUNT(ar.id) as total_records
            FROM subjects sub
            LEFT JOIN timetable t ON sub.id = t.subject_id AND t.institution_id = $1
            LEFT JOIN attendance_sessions s ON t.id = s.timetable_id
            LEFT JOIN attendance_records ar ON s.id = ar.session_id
            WHERE sub.institution_id = $1
            GROUP BY sub.name
            ORDER BY 
                CASE WHEN COUNT(ar.id) > 0 THEN 1 ELSE 0 END DESC,
                (COUNT(ar.id) FILTER (WHERE ar.status = 'Present')::float / NULLIF(COUNT(ar.id), 0)) DESC NULLS LAST,
                sub.name ASC
            LIMIT 20
        `, [institutionId]);

        const subjectPerformance = subjectStatsRes.rows.map(row => {
            const total = parseInt(row.total_records);
            const present = parseInt(row.present_count);
            return {
                subject: row.subject,
                percentage: total > 0 ? Math.round((present / total) * 100) : 0,
                hasData: total > 0
            };
        });

        // 9. QR Interval from institutions settings JSONB
        const settingsRes = await query(`SELECT settings FROM institutions WHERE id = $1`, [institutionId]);
        const qrInterval = parseInt(settingsRes.rows[0]?.settings?.qr_refresh_interval || '5', 10);

        return NextResponse.json({
            stats: {
                totalStudents,
                presentToday,
                absentToday,
                monthlyRate,
                qrInterval
            },
            recentActivity,
            activeSessions,
            subjectPerformance,
            chartData: chartData.length > 0 ? chartData : [
                { name: 'No Data', present: 0, absent: 0 }
            ]
        });

    } catch (error: any) {
        console.error('Tuition Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

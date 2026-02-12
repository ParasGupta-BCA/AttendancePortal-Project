import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Total Students
        const studentCountRes = await query('SELECT COUNT(*) FROM students');
        const totalStudents = parseInt(studentCountRes.rows[0].count);

        // 2. Present Today (Unique students marked present in any session today)
        const presentTodayRes = await query(`
      SELECT COUNT(DISTINCT student_id) 
      FROM attendance_records 
      WHERE status = 'Present' 
      AND marked_at::date = CURRENT_DATE
    `);
        const presentToday = parseInt(presentTodayRes.rows[0].count);

        // 3. Absent Today (Total Students - Present Today)
        // Note: This is an approximation. Ideally we check against scheduled classes. 
        // But for dashboard summary, this is a common metric.
        const absentToday = totalStudents - presentToday;

        // 4. Monthly Attendance Rate
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        const monthStatsRes = await query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'Present') as present,
                COUNT(*) as total
            FROM attendance_records
            WHERE marked_at >= $1
        `, [currentMonthStart]);

        const monthPresent = parseInt(monthStatsRes.rows[0].present);
        const monthTotal = parseInt(monthStatsRes.rows[0].total);
        const monthlyRate = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0;

        // 3. Recent Activity (Last 5 records)
        const recentActivityRes = await query(`
            SELECT ar.marked_at, s.enrollment_no, sub.code as subject_code
            FROM attendance_records ar
            JOIN students s ON ar.student_id = s.id
            JOIN attendance_sessions as_sess ON ar.session_id = as_sess.id
            JOIN timetable t ON as_sess.timetable_id = t.id
            JOIN subjects sub ON t.subject_id = sub.id
            ORDER BY ar.marked_at DESC
            LIMIT 5
        `);
        const recentActivity = recentActivityRes.rows;

        // 5. Chart Data (Last 7 Days)
        const chartRes = await query(`
            SELECT 
                to_char(marked_at, 'Dy') as name,
                COUNT(*) FILTER (WHERE status = 'Present') as present,
                COUNT(*) FILTER (WHERE status = 'Absent') as absent
            FROM attendance_records
            WHERE marked_at > CURRENT_DATE - INTERVAL '7 days'
            GROUP BY 1, marked_at::date
            ORDER BY marked_at::date
        `);

        // Fill in missing days if needed, but for now just return what we have
        const chartData = chartRes.rows.map(row => ({
            name: row.name,
            present: parseInt(row.present),
            absent: parseInt(row.absent)
        }));

        // 6. Active Sessions
        // Fetch currently active sessions to allow Admin to monitor/close them
        const activeSessionsRes = await query(`
            SELECT s.id, s.qr_code, sub.name as subject_name, c.name as class_name, c.section, f.designation, u.full_name as faculty_name
            FROM attendance_sessions s
            JOIN timetable t ON s.timetable_id = t.id
            JOIN subjects sub ON t.subject_id = sub.id
            JOIN classes c ON t.class_id = c.id
            LEFT JOIN faculty f ON s.faculty_id = f.id
            LEFT JOIN users u ON f.user_id = u.id
            WHERE s.is_active = TRUE
            ORDER BY s.start_time DESC
        `);
        const activeSessions = activeSessionsRes.rows;

        // 7. Subject Performance (Avg Attendance per Subject)
        // Modified to include ALL subjects via LEFT JOIN, even if no records yet
        const subjectStatsRes = await query(`
            SELECT 
                sub.name as subject,
                COUNT(ar.id) FILTER (WHERE ar.status = 'Present') as present_count,
                COUNT(ar.id) as total_records
            FROM subjects sub
            LEFT JOIN timetable t ON sub.id = t.subject_id
            LEFT JOIN attendance_sessions s ON t.id = s.timetable_id
            LEFT JOIN attendance_records ar ON s.id = ar.session_id
            GROUP BY sub.name
            ORDER BY 
                CASE WHEN COUNT(ar.id) > 0 THEN 1 ELSE 0 END DESC, -- Put active subjects first
                (COUNT(ar.id) FILTER (WHERE ar.status = 'Present')::float / NULLIF(COUNT(ar.id), 0)) DESC NULLS LAST,
                sub.name ASC
            LIMIT 20
        `);

        const subjectPerformance = subjectStatsRes.rows.map(row => {
            const total = parseInt(row.total_records);
            const present = parseInt(row.present_count);
            return {
                subject: row.subject,
                percentage: total > 0 ? Math.round((present / total) * 100) : 0,
                hasData: total > 0 // Flag to optionally show "No Data" vs "0%"
            };
        });

        // 8. Dynamic QR Settings
        const settingsRes = await query(`SELECT value FROM attendance_settings WHERE key = 'qr_refresh_interval'`);
        const qrInterval = parseInt(settingsRes.rows[0]?.value || '5', 10);

        return NextResponse.json({
            stats: {
                totalStudents,
                presentToday,
                absentToday,
                monthlyRate,
                qrInterval // Include in stats
            },
            recentActivity,
            activeSessions,
            subjectPerformance,
            chartData: chartData.length > 0 ? chartData : [
                { name: 'No Data', present: 0, absent: 0 }
            ]
        });

    } catch (error: any) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

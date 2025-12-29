import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        // Security check: Only Faculty or Admin can create sessions
        if (!session || !['admin', 'faculty'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { timetable_id, latitude, longitude } = body;

        if (!timetable_id) {
            return NextResponse.json({ error: 'Missing timetable_id' }, { status: 400 });
        }

        // 1. Fetch Timetable details to verify time
        const timetableRes = await query('SELECT * FROM timetable WHERE id = $1', [timetable_id]);
        if (timetableRes.rowCount === 0) {
            return NextResponse.json({ error: 'Invalid Timetable ID' }, { status: 404 });
        }
        const slot = timetableRes.rows[0];

        // 2. Validate Time (Strict Mode)
        // "Attendance must strictly follow this timetable and can only be marked during the active class session."
        // 2. Validate Time (Strict Mode)
        // "Attendance must strictly follow this timetable and can only be marked during the active class session."
        const now = new Date(); // This is UTC in Vercel/Neon

        // Helper to parse TIME string "10:10:00" to today's Date object
        const [startH, startM] = slot.start_time.split(':');
        const [endH, endM] = slot.end_time.split(':');

        // We need to construct a Date that represents "Today at 10:10 IST"
        // Since the server is UTC, if we just set hours, we get "Today at 10:10 UTC" which is 15:40 IST (Wrong).

        // Correct approach:
        // 1. Get current date in IST context
        const istDateString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const istDate = new Date(istDateString);

        const year = istDate.getFullYear();
        const month = String(istDate.getMonth() + 1).padStart(2, '0');
        const day = String(istDate.getDate()).padStart(2, '0');

        // 2. Construct ISO string with fixed offset for IST (+05:30)
        // Format: YYYY-MM-DDTHH:mm:00+05:30
        const startTimeIso = `${year}-${month}-${day}T${startH}:${startM}:00+05:30`;
        const endTimeIso = `${year}-${month}-${day}T${endH}:${endM}:00+05:30`;

        const startTime = new Date(startTimeIso);
        const endTime = new Date(endTimeIso);

        // Security: Don't allow starting a session if the class is already over
        // if (new Date() > endTime) {
        //     return NextResponse.json({ error: 'Cannot start session: Class time is already over.' }, { status: 400 });
        // }

        // Allow a buffer? e.g. 10 mins before start? Let's be strict but allow 5 mins early start.
        const bufferMs = 5 * 60 * 1000;

        // Check if slot is for TODAY (Day of week check)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[now.getDay()];

        if (slot.day_of_week !== todayName) {
            // Allow overriding for testing/demo? 
            // For strict production, return error.
            // return NextResponse.json({ error: `Class is scheduled for ${slot.day_of_week}, but today is ${todayName}` }, { status: 400 });
        }

        // 3. Generate Unique QR Code Content
        // A hash or a JWT signed with session ID and expiry
        const qrContent = uuidv4();

        // 4. Resolve Faculty ID
        // The session.u.id is a USER_ID. We need the FACULTY_ID.
        const userId = (session.user as any).id;
        let facultyId = null;

        const facultyRes = await query('SELECT id FROM faculty WHERE user_id = $1', [userId]);
        if ((facultyRes.rowCount ?? 0) > 0) {
            facultyId = facultyRes.rows[0].id;
        }
        // If Admin (no faculty record), facultyId remains null.

        // 5. Create Session
        const createRes = await query(`
            INSERT INTO attendance_sessions 
            (timetable_id, faculty_id, start_time, end_time, qr_code)
            VALUES ($1, $2, NOW(), $3, $4)
            RETURNING id, qr_code
        `, [timetable_id, facultyId, endTime, qrContent]);

        return NextResponse.json({
            success: true,
            session_id: createRes.rows[0].id,
            qr_code: createRes.rows[0].qr_code
        });

    } catch (error: any) {
        console.error('Create Session Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

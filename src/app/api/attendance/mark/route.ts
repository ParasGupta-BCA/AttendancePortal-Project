import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { qr_code, lat, long } = body;
    const session = await getServerSession(authOptions);

    // 1. Auth Check
    if (!session || (session.user as any)?.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized. Only students can mark attendance.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    let studentId: string | null = null;
    let sessionId: string | null = null;
    let scanStatus = 'ERROR';
    let logMessage = '';
    let distance = 0;

    try {
        // Fetch Student ID
        const studentRes = await query('SELECT id FROM students WHERE user_id = $1', [userId]);
        if (studentRes.rowCount === 0) {
            throw new Error('Student profile not found');
        }
        studentId = studentRes.rows[0].id;

        // 2. Validate Inputs
        if (!qr_code) {
            scanStatus = 'ERROR';
            logMessage = 'Missing QR Code';
            throw new Error(logMessage);
        }
        if (!lat || !long) {
            scanStatus = 'ERROR';
            logMessage = 'Location permission denied or unavailable';
            await logScan(studentId, null, 'ERROR', null, null, null, logMessage); // Log early failure
            return NextResponse.json({ error: 'Location required. Please enable GPS permissions.' }, { status: 400 });
        }

        // 3. QR Validation & Session Retrieval
        const sessionRes = await query(`
            SELECT * FROM attendance_sessions 
            WHERE qr_code = $1 AND is_active = TRUE 
        `, [qr_code]);

        if (sessionRes.rowCount === 0) {
            scanStatus = 'INVALID_QR';
            logMessage = 'Invalid or inactive QR code';
            await logScan(studentId, null, scanStatus, lat, long, null, logMessage);
            return NextResponse.json({ error: 'Invalid QR Code' }, { status: 400 });
        }

        const attendanceSession = sessionRes.rows[0];
        sessionId = attendanceSession.id;

        // 4. Time Validation
        const timeCheck = await query(`SELECT NOW() > $1 as is_expired`, [attendanceSession.end_time]);
        if (timeCheck.rows[0].is_expired) {
            scanStatus = 'EXPIRED';
            logMessage = 'Session expired';
            await logScan(studentId, sessionId, scanStatus, lat, long, null, logMessage);
            return NextResponse.json({ error: 'Attendance period is over.' }, { status: 400 });
        }

        // 5. Geolocation Validation
        // Fetch Settings
        const settingsRes = await query(`SELECT key, value FROM attendance_settings WHERE key IN ('campus_lat', 'campus_long', 'allowed_radius_meters')`);
        const settings = settingsRes.rows.reduce((acc: any, row: any) => ({ ...acc, [row.key]: row.value }), {});

        const campusLat = parseFloat(settings.campus_lat);
        const campusLong = parseFloat(settings.campus_long);
        const allowedRadius = parseFloat(settings.allowed_radius_meters || '100'); // Default 100m

        if (!isNaN(campusLat) && !isNaN(campusLong)) {
            distance = calculateDistance(lat, long, campusLat, campusLong);
            
            if (distance > allowedRadius) {
                scanStatus = 'OUT_OF_RANGE';
                logMessage = `Out of range (${Math.round(distance)}m). Must be within ${allowedRadius}m.`;
                await logScan(studentId, sessionId, scanStatus, lat, long, distance, logMessage);
                return NextResponse.json({ 
                    error: `You are ${Math.round(distance)}m away from class. You must be inside the campus.` 
                }, { status: 400 });
            }
        } else {
            console.warn("Campus coordinates not set in attendance_settings");
            // Optionally fail open or closed. Here we proceed if settings are missing but warn.
        }

        // 6. Check Duplicate
        const existingRecord = await query(`
            SELECT id FROM attendance_records 
            WHERE session_id = $1 AND student_id = $2
        `, [sessionId, studentId]);

        if ((existingRecord.rowCount || 0) > 0) {
            scanStatus = 'SUCCESS'; // Or some other status for duplicate?
            logMessage = 'Duplicate scan';
            await logScan(studentId, sessionId, 'SUCCESS', lat, long, distance, 'Already marked');
            return NextResponse.json({ message: 'Attendance already marked' }, { status: 200 });
        }

        // 7. Mark Attendance
        await query(`
            INSERT INTO attendance_records (session_id, student_id, status, marked_at, location_lat, location_long)
            VALUES ($1, $2, 'Present', NOW(), $3, $4)
        `, [sessionId, studentId, lat, long]);

        await logScan(studentId, sessionId, 'SUCCESS', lat, long, distance, 'Attendance Marked');

        return NextResponse.json({ success: true, message: 'Attendance Marked Successfully' });

    } catch (error: any) {
        console.error('Mark Attendance Error:', error);
        // Try to log the system error if we have a studentId
        if (studentId) {
             await logScan(studentId, sessionId, 'ERROR', lat, long, null, error.message);
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// Helper: Haversine Formula for distance in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Helper: Log to DB
async function logScan(studentId: string | null, sessionId: string | null, status: string, lat: number | null, long: number | null, distance: number | null, message: string) {
    try {
        await query(`
            INSERT INTO scan_logs (student_id, session_id, scan_status, lat, long, distance_meters, message)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [studentId, sessionId, status, lat, long, distance, message]);
    } catch (e) {
        console.error("Failed to log scan:", e);
    }
}

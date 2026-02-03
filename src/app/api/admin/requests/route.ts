import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { hash } from 'bcryptjs';
import pool from '@/lib/db'; // Import pool for transactions

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await query(
            `SELECT * FROM student_requests WHERE status = 'pending' ORDER BY created_at ASC`
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching requests:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { requestId, action } = body; // action: 'approve' | 'reject'

        if (!requestId || !action) {
            return NextResponse.json({ message: 'Missing requestId or action' }, { status: 400 });
        }

        if (action === 'reject') {
            await query(`UPDATE student_requests SET status = 'rejected' WHERE id = $1`, [requestId]);
            return NextResponse.json({ message: 'Request rejected' });
        }

        if (action === 'approve') {
            // Get request details
            const reqResult = await query(`SELECT * FROM student_requests WHERE id = $1`, [requestId]);

            if (reqResult.rowCount === 0) {
                return NextResponse.json({ message: 'Request not found' }, { status: 404 });
            }

            const request = reqResult.rows[0];

            // Double check if user already exists to avoid DB unique constraint errors mid-transaction
            const userCheck = await query('SELECT id FROM users WHERE email = $1', [request.email]);
            if (userCheck.rowCount && userCheck.rowCount > 0) {
                return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
            }

            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                // 1. Create User with default password 'student'
                const passwordHash = await hash('student', 10);
                const insertUserText = `
          INSERT INTO users (email, password_hash, full_name, role)
          VALUES ($1, $2, $3, 'student')
          RETURNING id
        `;
                const userRes = await client.query(insertUserText, [
                    request.email,
                    passwordHash,
                    request.full_name,
                ]);
                const userId = userRes.rows[0].id;

                // 2. Create Student Profile
                const insertStudentText = `
          INSERT INTO students (user_id, enrollment_no, erp_id, course_year, section)
          VALUES ($1, $2, $3, $4, $5)
        `;
                await client.query(insertStudentText, [
                    userId,
                    request.enrollment_no,
                    request.erp_id,
                    request.course_year,
                    request.section,
                ]);

                // 3. Mark request as approved
                await client.query(
                    `UPDATE student_requests SET status = 'approved' WHERE id = $1`,
                    [requestId]
                );

                await client.query('COMMIT');
                return NextResponse.json({ message: 'Request approved and student created.' });
            } catch (err) {
                await client.query('ROLLBACK');
                console.error('Transaction error:', err);
                return NextResponse.json({ message: 'Failed to approve request' }, { status: 500 });
            } finally {
                client.release();
            }
        }

        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

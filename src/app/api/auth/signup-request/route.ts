import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, enrollmentNo, erpId, courseYear, section } = body;

    // Basic validation
    if (!fullName || !email || !enrollmentNo || !erpId || !courseYear || !section) {
      return NextResponse.json(
        { message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Check if email already exists in users
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      return NextResponse.json(
        { message: 'Email already registered.' },
        { status: 409 }
      );
    }

    // Check if enrollment already exists in students
    const existingStudent = await query('SELECT id FROM students WHERE enrollment_no = $1 OR erp_id = $2', [enrollmentNo, erpId]);
    if (existingStudent.rowCount && existingStudent.rowCount > 0) {
      return NextResponse.json(
        { message: 'Enrollment Number or ERP ID already registered.' },
        { status: 409 }
      );
    }

    // Check if a pending request already exists for this email or enrollment
    const existingRequest = await query(
      `SELECT id FROM student_requests 
       WHERE (email = $1 OR enrollment_no = $2 OR erp_id = $3) 
       AND status = 'pending'`,
      [email, enrollmentNo, erpId]
    );

    if (existingRequest.rowCount && existingRequest.rowCount > 0) {
      return NextResponse.json(
        { message: 'A pending request with these details already exists.' },
        { status: 409 }
      );
    }

    // Insert new request
    await query(
      `INSERT INTO student_requests (full_name, email, enrollment_no, erp_id, course_year, section)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [fullName, email, enrollmentNo, erpId, courseYear, section]
    );

    return NextResponse.json(
      { message: 'Signup request submitted successfully.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup request error:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}

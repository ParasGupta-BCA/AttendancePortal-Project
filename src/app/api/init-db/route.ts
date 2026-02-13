import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // raw SQL from student_requests.sql
        await query(`
      CREATE TABLE IF NOT EXISTS student_requests (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          full_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          enrollment_no VARCHAR(50) UNIQUE NOT NULL,
          erp_id VARCHAR(50) UNIQUE NOT NULL,
          course_year VARCHAR(20) DEFAULT 'BCA VI',
          section VARCHAR(10) DEFAULT 'Morning',
          status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_student_requests_status ON student_requests(status);
    `);

        return NextResponse.json({ message: 'Table created successfully' });
    } catch (error) {
        console.error('Error creating table:', error);
        return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
    }
}

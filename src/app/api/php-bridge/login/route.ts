import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { status: 'error', message: 'Missing credentials' },
                { status: 400 }
            );
        }

        // Use a simpler regex or basic check
        const isValidEmail = email.includes('@');
        const isValidPassword = password.length > 5;

        if (isValidEmail && isValidPassword) {
            return NextResponse.json({
                status: 'success',
                message: 'Login Successful',
                token: `php_jwt_token_${Date.now()}`,
                user: {
                    id: 101,
                    email: email,
                    role: 'student'
                }
            });
        } else {
            return NextResponse.json(
                { status: 'error', message: 'Invalid credentials' },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { status: 'error', message: 'Invalid JSON input' },
            { status: 400 }
        );
    }
}

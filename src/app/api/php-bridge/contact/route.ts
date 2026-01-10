import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, message } = body;

    // Simulate PHP processing delay
    // await new Promise(resolve => setTimeout(resolve, 500));

    if (!message) {
      return NextResponse.json(
        { status: 'error', message: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: `Thank you, ${name || 'Anonymous'}. Your message has been received by the PHP Backend (Bridge).`,
      timestamp: new Date().toISOString(),
      server_software: 'Apache/2.4.58 (Win64) OpenSSL/3.1.3 PHP/8.2.12 (Simulated)'
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Invalid JSON input' },
      { status: 400 }
    );
  }
}

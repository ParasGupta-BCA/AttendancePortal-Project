import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const isAuth = !!token;
    const isAuthPage = request.nextUrl.pathname.startsWith('/login');

    // If user is not authenticated and trying to access protected routes
    if (!isAuth) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/student/:path*", "/faculty/:path*", "/admin/:path*"],
};

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

    const response = NextResponse.next();

    // Strict Cache-Control headers to prevent Back button access after logout
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
}

export const config = {
    matcher: ["/student/:path*", "/faculty/:path*", "/admin/:path*"],
};

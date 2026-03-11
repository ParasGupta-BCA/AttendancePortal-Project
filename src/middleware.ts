import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const isAuth = !!token;
    
    // Check if accessing an old college route or a new tuition route
    const isTuitionRoute = request.nextUrl.pathname.startsWith('/tuition') && !request.nextUrl.pathname.startsWith('/tuition/login');
    const isCollegeRoute = !request.nextUrl.pathname.startsWith('/tuition');

    // If accessing protected routes without auth
    if (!isAuth) {
        // Redirect to specific login based on path
        if (request.nextUrl.pathname.startsWith('/tuition')) {
            return NextResponse.redirect(new URL('/tuition/login', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Safety constraint: Prevent cross-contamination
    // If a Neon user tries to access /tuition, or a Supabase user tries to access /student
    if (isAuth) {
        if (isTuitionRoute && !token.is_tuition_user) {
            return NextResponse.redirect(new URL('/login', request.url)); // Send back to origin
        }
        if (isCollegeRoute && token.is_tuition_user) {
            return NextResponse.redirect(new URL('/tuition/dashboard', request.url)); // Send back to origin
        }
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
    matcher: ["/student/:path*", "/faculty/:path*", "/admin/:path*", "/tuition/:path*"],
};

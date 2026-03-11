import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Allow tuition register page through ALWAYS — it's a public page
    if (path === '/register-tuition') {
        return NextResponse.next();
    }

    // --- 1. Bypass all checks for login/public pages ---
    // If we are already on a login page, DO NOT redirect if unauthenticated.
    // If we ARE authenticated, redirect them to the correct dashboard.
    const isCollegeLoginPage = path === '/login' || path === '/signup' || path.startsWith('/forgot-password') || path.startsWith('/reset-password');
    const isTuitionLoginPage = path === '/tuition/login' || path === '/tuition/register';

    const token = await getToken({ req: request });
    const isAuth = !!token;

    if (isCollegeLoginPage || isTuitionLoginPage) {
        if (isAuth) {
            // They are logged in but trying to view a login page. Send to dashboard.
            if (token.is_tuition_user) {
                 return NextResponse.redirect(new URL('/tuition/dashboard', request.url));
            } else {
                 // Send to respective college dashboard based on role
                 if (token.role === 'admin' || token.role === 'superadmin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
                 if (token.role === 'faculty') return NextResponse.redirect(new URL('/faculty/dashboard', request.url));
                 if (token.role === 'student') return NextResponse.redirect(new URL('/student/dashboard', request.url));
            }
        }
        // If they are not logged in and viewing a login page, just let them see it!
        return NextResponse.next();
    }

    // --- 2. Protect Authenticated Routes ---
    
    // If accessing protected routes without auth
    if (!isAuth) {
        if (path.startsWith('/tuition')) {
            return NextResponse.redirect(new URL('/tuition/login', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // --- 3. Safety constraint: Prevent cross-contamination ---
    const isTuitionRoute = path.startsWith('/tuition');
    const isCollegeRoute = !path.startsWith('/tuition') && (path.startsWith('/student') || path.startsWith('/faculty') || path.startsWith('/admin'));

    if (isTuitionRoute && !token.is_tuition_user) {
        return NextResponse.redirect(new URL('/login', request.url)); // College user tried to access tuition route
    }
    if (isCollegeRoute && token.is_tuition_user) {
        return NextResponse.redirect(new URL('/tuition/dashboard', request.url)); // Tuition user tried to access college route
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
    // We must include login paths in the matcher so the middleware can redirect them AWAY from login if they are already authenticated.
    matcher: ["/student/:path*", "/faculty/:path*", "/admin/:path*", "/tuition/:path*", "/login", "/tuition/login", "/register-tuition", "/signup", "/forgot-password", "/reset-password"],
};

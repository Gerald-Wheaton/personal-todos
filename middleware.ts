import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/signup'];
const sharedTodoPattern = /^\/todo\/\d+$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session');
  const hasSession = !!session?.value;

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    // If already logged in, redirect to home
    if (hasSession) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Handle /todo/[id] shared links
  if (sharedTodoPattern.test(pathname)) {
    if (!hasSession) {
      // Store the category ID in a cookie and redirect to signup
      const categoryId = pathname.split('/')[2];
      const response = NextResponse.redirect(new URL('/signup', request.url));
      response.cookies.set('pending_category_id', categoryId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });
      return response;
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

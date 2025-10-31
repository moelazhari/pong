import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from './lib/axios';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.headers.get('cookie') || '';


  const accessToken = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');

  // ========================================
  // ROUTE DEFINITIONS
  // ========================================
  
  // Routes anyone can access (no auth needed)
  const publicRoutes = ['/'];
  
  // Routes that need auth but have special handling
  const twoFactorRoute = '/verify-2fa';
  const profileCompletionRoute = '/complete-profile';
  
  // Routes that skip profile completion check
  // WHY? Because these routes are needed BEFORE profile can be completed
  const skipProfileCheckRoutes = [
    '/complete-profile',     // Can't check profile on the profile completion page
    '/', 
  ];
  
  // Routes that need full auth (token + 2FA verified + profile complete)
  const protectedRoutes = ['/game', '/profile', '/settings','leaderboard', '/chat', 'channel'];

  // ========================================
  // ROUTE CLASSIFICATION
  // ========================================
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = pathname === '/'
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const skipProfileCheck = skipProfileCheckRoutes.some((route) => pathname.startsWith(route));

  // ========================================
  // 1. TOKEN REFRESH
  // ========================================
  
  if (!accessToken && refreshToken) {
    console.log("TOKEN REFRESH");
    try {
      console.log(cookies);
      const response = await axios.post("/auth/refresh", {
        headers: { cookie: cookies },
      });

      if (response.ok) {
        const newResponse = NextResponse.next();
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          newResponse.headers.set('set-cookie', setCookieHeader);
        }
        return newResponse;
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error.response.data.message);
    }
  }
  
  // ========================================
  // 2. PROTECTED ROUTES
  // ========================================
  if (isProtectedRoute) {
    console.log("PROTECTED ROUTES")
    // No token at all - redirect to login
    if (!accessToken) {
      const url = new URL('/', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    try {
      const response  = await axios.get("/auth/me", {
        headers: { cookie: cookies },
      })
      
      if (!response.ok) {
        const url = new URL('/', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      
      console.log("response.data");

      const user = response.data;
      
      // ========================================
      // 3. CHECK PROFILE COMPLETION
      // ========================================
      // Profile incomplete and not on a route that skips this check
      // WHY SKIP? Some routes need to work BEFORE profile is complete
      if (!user.completeProfile && !skipProfileCheck) {
        const url = new URL(profileCompletionRoute, request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      
      // User on profile completion page but already complete
      if (pathname === profileCompletionRoute && user.completeProfile) {
        return NextResponse.redirect(new URL('/profile', request.url));
      }
      
      // ========================================
      // 4. CHECK 2FA VERIFICATION
      // ========================================
      // User has 2FA enabled but hasn't verified in this session
      // WHY CHECK? User could have token from login but not yet verified 2FA code
      if (user.fact2Auth && !user.fact2Verified && pathname !== twoFactorRoute) {
        const url = new URL(twoFactorRoute, request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      
      // User is on 2FA page but already verified or doesn't have 2FA
      if (pathname === twoFactorRoute && (!user.fact2Auth || user.fact2Verified)) {
        return NextResponse.redirect(new URL('/profile', request.url));
      }
      
    } catch (error) {
      console.error('User verification failed:', error);
      const url = new URL('/', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // ========================================
  // 5. AUTH ROUTES (login/signup)
  // ========================================
  if (isAuthRoute && accessToken) {
    // Already has token - check if they need 2FA or profile completion
    console.log("AUTH ROUTES");
    

    try {
      const { data } = await axios.get("/auth/me", {
        headers: { cookie: cookies },
      });

      if (data) {        
        const user = data.user
        
        // Redirect to appropriate page based on status
        if (!user.completeProfile) {
          return NextResponse.redirect(new URL('/complete-profile', request.url));
        }
        if (user.fact2Auth && !user.fact2Verified) {
          return NextResponse.redirect(new URL('/verify-2fa', request.url));
        }
        return NextResponse.redirect(new URL('/profile', request.url));
      }
    } catch (error: any) {
      console.log("hhhhhhh");
      console.log(error.response.data.message);
      // If check fails, let them access login/signup
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
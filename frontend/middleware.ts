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
  const twoFactorRoute = '/verify-2fa';
  const profileCompletionRoute = '/complete-profile';
  
  // const skipProfileCheckRoutes = [
  //   '/complete-profile',
  // ];
  
  const protectedRoutes = ['/game', '/profile', '/settings', '/leaderboard', '/chat', '/channel'];

  // ========================================
  // ROUTE CLASSIFICATION
  // ========================================
  const isAuthRoute = pathname === '/';
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  // const skipProfileCheck = skipProfileCheckRoutes.some((route) => pathname.startsWith(route));

  // ========================================
  // 1. TOKEN REFRESH
  // ========================================
  if (!accessToken && refreshToken) {
    console.log("🔄 TOKEN REFRESH");
    try {
      const response = await axios.post("/auth/refresh", {}, {
        headers: { cookie: cookies },
      });

      if (response.status === 200) {
        return NextResponse.next();
      }
    } catch (error: any) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.headers.append('Set-Cookie', 'access_token=; Path=/; HttpOnly; Max-Age=0');
      response.headers.append('Set-Cookie', 'refresh_token=; Path=/; HttpOnly; Max-Age=0');
      
      return response;
    }
  }
  
  // ========================================
  // 2. PROTECTED ROUTES
  // ========================================
  if (isProtectedRoute) {
 
    if (!accessToken) {
      const url = new URL('/', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    try {
      const response = await axios.get("/users/me", {
        headers: { cookie: cookies },
      });

      const user = response.data;
      
      console.log("✅ User data:", {
        completeProfile: user.completeProfile,
        fact2Auth: user.fact2Auth,
        fact2Verified: user.fact2Verified,
      });

      // ========================================
      // 4.PROFILE COMPLETION
      // ========================================
      if (!user.completeProfile) {
        const url = new URL(profileCompletionRoute, request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      
      if (pathname === profileCompletionRoute && user.completeProfile) {
        console.log("✅ Profile already complete, redirecting to profile");
        return NextResponse.redirect(new URL('/profile', request.url));
      }
      
      // ========================================
      // 3.2FA VERIFICATION
      // ========================================
      if (user.fact2Auth && !user.fact2Verified && pathname !== twoFactorRoute) {
        const url = new URL(twoFactorRoute, request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      
      // User is on 2FA page but already verified or doesn't have 2FA
      if (pathname === twoFactorRoute && (!user.fact2Auth || user.fact2Verified)) {
        console.log("✅ 2FA already verified, redirecting to profile");
        return NextResponse.redirect(new URL('/profile', request.url));
      }


      return NextResponse.next();
      
      
    } catch (error: any) {
      const url = new URL('/', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ========================================
  // 5. COMPLETE-PROFILE ROUTE PROTECTION
  // ========================================
  if (pathname === '/complete-profile') {
    if (!accessToken || !refreshToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  
  // ========================================
  // 6. AUTH ROUTES
  // ========================================
  if (isAuthRoute && accessToken) {
    
    try {
      const response = await axios.get("/users/me", {
        headers: { cookie: cookies },
      });

      const user = response.data;
      
      console.log("✅ User status:", {
        completeProfile: user.completeProfile,
        fact2Auth: user.fact2Auth,
        fact2Verified: user.fact2Verified,
      });

      if (!user.completeProfile) {
        return NextResponse.redirect(new URL('/complete-profile', request.url));
      }
      
      if (user.fact2Auth && !user.fact2Verified) {
        return NextResponse.redirect(new URL('/verify-2fa', request.url));
      }
      
      return NextResponse.redirect(new URL('/profile', request.url));
      
    } catch (error: any) {
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
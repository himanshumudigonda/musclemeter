import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

// Routes that should redirect to dashboard if already logged in
const authRoutes = ["/login"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const pathname = req.nextUrl.pathname;

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          res = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if accessing protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if accessing auth route (login, signup)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Not logged in, trying to access protected route -> redirect to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", req.url);
    
    // Determine role from the path
    if (pathname.includes("/owner")) {
      redirectUrl.searchParams.set("role", "owner");
    } else if (pathname.includes("/user")) {
      redirectUrl.searchParams.set("role", "athlete");
    }
    
    // Save the original destination for after login
    redirectUrl.searchParams.set("redirect", pathname);
    
    return NextResponse.redirect(redirectUrl);
  }

  // Logged in, trying to access auth route -> redirect to appropriate dashboard
  if (isAuthRoute && user) {
    // Fetch user profile to determine role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "athlete";
    
    if (role === "owner") {
      return NextResponse.redirect(new URL("/dashboard/owner", req.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard/user", req.url));
    }
  }

  // Role-based access control for dashboard routes
  if (isProtectedRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role || "athlete";

    // Athlete trying to access owner routes
    if (pathname.startsWith("/dashboard/owner") && userRole !== "owner") {
      return NextResponse.redirect(new URL("/dashboard/user", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};

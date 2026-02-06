import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get user to determine role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check for pending role from signup
        // Since we can't access localStorage here, check if profile has a role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single() as { data: { role: string } | null };

        const role = profile?.role || "athlete";
        
        // Redirect to appropriate dashboard
        if (role === "owner") {
          return NextResponse.redirect(`${origin}/dashboard/owner/create`);
        } else {
          return NextResponse.redirect(`${origin}/dashboard/user`);
        }
      }
      
      // Fallback to next param or home
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

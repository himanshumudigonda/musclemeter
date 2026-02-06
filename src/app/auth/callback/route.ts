import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  
  // Get pending role from cookie (set before OAuth redirect)
  const cookieStore = await cookies();
  const pendingRole = cookieStore.get("pendingRole")?.value as "athlete" | "owner" | undefined;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get user to determine role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // If role was stored in cookie, update the profile and redirect
        if (pendingRole === "owner" || pendingRole === "athlete") {
          await supabase
            .from("profiles")
            .update({ role: pendingRole } as never)
            .eq("id", user.id);
          
          // Clear the cookie
          const response = pendingRole === "owner" 
            ? NextResponse.redirect(`${origin}/dashboard/owner/create`)
            : NextResponse.redirect(`${origin}/dashboard/user`);
          
          response.cookies.delete("pendingRole");
          return response;
        }
        
        // Fallback: check existing profile role
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

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase renamed "anon key" to "publishable key"; accept either
// depending on which naming was used when the project's env vars were set.
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Runs on every request via middleware — skip Supabase entirely rather
  // than crash the whole site if env vars aren't configured yet.
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Required to actually refresh the session cookie — do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isStudentRoute = request.nextUrl.pathname.startsWith("/student");

  if (isAdminRoute || isStudentRoute) {
    // Any redirect below must carry forward the (possibly just-refreshed)
    // session cookies from supabaseResponse, or the user gets bounced into
    // a stale-session loop.
    const redirectWithSessionCookies = (url: URL) => {
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    };

    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return redirectWithSessionCookies(loginUrl);
    }

    // Fetched once and reused below — both the suspension gate (applies to
    // /admin/* and /student/*) and the admin-role gate (admin-only) need it.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();

    // A suspended account (admin toggles this off StudentDirectory) must
    // lose access to every gated route immediately on its next navigation —
    // otherwise "Suspend" is cosmetic. Checked before the role gate so a
    // suspended admin is bounced too, not just suspended students.
    if (profile?.status === "suspended") {
      return redirectWithSessionCookies(new URL("/auth/suspended", request.url));
    }

    // /student/* just requires a signed-in, non-suspended account (it shows
    // the caller's own data) — the stricter admin-role check below only
    // applies to /admin/*. `profile.role !== "admin"` also covers a missing
    // profile row or any unexpected role value, not just role === "student".
    if (isAdminRoute && (!profile || profile.role !== "admin")) {
      return redirectWithSessionCookies(new URL("/auth/unauthorized", request.url));
    }
  }

  return supabaseResponse;
};

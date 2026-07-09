import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Deletes a real Supabase Auth account. Requires the caller to be an
 * authenticated admin (re-verified here independent of the middleware
 * gate — an API route should never rely solely on middleware for auth)
 * and requires SUPABASE_SERVICE_ROLE_KEY to be configured, since deleting
 * an auth.users row is only possible via the Admin API. */
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id: targetUserId } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (targetUserId === user.id) {
    return NextResponse.json(
      { error: "You can't delete your own account from here." },
      { status: 400 },
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        error:
          "Deleting accounts requires SUPABASE_SERVICE_ROLE_KEY to be configured on the server. Add it in Vercel (Project Settings > Environment Variables), then redeploy.",
      },
      { status: 501 },
    );
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

  if (error) {
    console.error("[admin/students] Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete this account." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

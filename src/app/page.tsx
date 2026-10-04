import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", authData.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    console.error("Blackbird root membership error", membershipError);
    redirect("/login?error=No%20pudimos%20comprobar%20tu%20empresa.");
  }

  if (!membership) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}

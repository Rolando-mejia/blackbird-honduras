import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function getActiveContext() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("id,organization_id,role_id,status")
    .eq("user_id", authData.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    console.error("Blackbird active membership error", membershipError);
    throw new Error("No pudimos cargar tu acceso a la empresa.");
  }

  if (!membership) redirect("/onboarding");

  const [organizationResult, branchResult, roleResult] = await Promise.all([
    supabase
      .from("organizations")
      .select("id,trade_name,legal_name,rtn,type,country_code,currency_code,timezone,status")
      .eq("id", membership.organization_id)
      .single(),
    supabase
      .from("branches")
      .select("id,name,code,address,department,municipality,is_main,is_active")
      .eq("organization_id", membership.organization_id)
      .eq("is_active", true)
      .order("is_main", { ascending: false })
      .limit(1)
      .maybeSingle(),
    membership.role_id
      ? supabase.from("roles").select("id,name,description,is_system").eq("id", membership.role_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (organizationResult.error) {
    console.error("Blackbird organization context error", organizationResult.error);
    throw new Error("No pudimos cargar la organización.");
  }

  const fullName =
    typeof authData.user.user_metadata?.full_name === "string"
      ? authData.user.user_metadata.full_name
      : authData.user.email ?? "Usuario Blackbird";

  return {
    supabase,
    user: authData.user,
    fullName,
    membership,
    organization: organizationResult.data,
    branch: branchResult.data,
    role: roleResult.data,
  };
}

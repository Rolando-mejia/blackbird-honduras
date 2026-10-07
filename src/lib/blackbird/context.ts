import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function getActiveContext() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");

  const { data: memberships, error: membershipError } = await supabase
    .from("organization_members")
    .select("id,organization_id,role_id,status,job_title,all_branches")
    .eq("user_id", authData.user.id)
    .eq("status", "active")
    .order("created_at");

  if (membershipError) {
    console.error("Blackbird active membership error", membershipError);
    throw new Error("No pudimos cargar tu acceso a la empresa.");
  }

  if (!memberships?.length) redirect("/onboarding");

  const store = await cookies();
  const preferredOrg = store.get("bb_active_org")?.value;
  const membership =
    memberships.find((item) => item.organization_id === preferredOrg) ??
    memberships[0];

  const organizationIds = memberships.map((item) => item.organization_id);
  const { data: organizations, error: organizationsError } = await supabase
    .from("organizations")
    .select("id,trade_name,legal_name,rtn,type,country_code,currency_code,timezone,status")
    .in("id", organizationIds);

  if (organizationsError) {
    console.error("Blackbird organizations context error", organizationsError);
    throw new Error("No pudimos cargar tus empresas.");
  }

  const organization = organizations?.find(
    (item) => item.id === membership.organization_id,
  );

  if (!organization) redirect("/onboarding");

  const { data: role } = membership.role_id
    ? await supabase
        .from("roles")
        .select("id,name,description,is_system,is_owner_role,is_active")
        .eq("id", membership.role_id)
        .maybeSingle()
    : { data: null };

  let branchIds: string[] | null = null;

  if (!membership.all_branches && !role?.is_owner_role) {
    const { data: accessRows } = await supabase
      .from("organization_member_branches")
      .select("branch_id")
      .eq("organization_member_id", membership.id);

    branchIds = (accessRows ?? []).map((item) => item.branch_id);
  }

  let branchQuery = supabase
    .from("branches")
    .select("id,name,code,address,department,municipality,is_main,is_active,is_virtual")
    .eq("organization_id", membership.organization_id)
    .eq("is_active", true)
    .order("is_main", { ascending: false })
    .order("name");

  if (branchIds !== null) {
    if (branchIds.length === 0) {
      branchQuery = branchQuery.eq(
        "id",
        "00000000-0000-0000-0000-000000000000",
      );
    } else {
      branchQuery = branchQuery.in("id", branchIds);
    }
  }

  const { data: branches } = await branchQuery;
  const preferredBranch = store.get("bb_active_branch")?.value;
  const branch =
    (branches ?? []).find((item) => item.id === preferredBranch) ??
    (branches ?? []).find((item) => item.is_main) ??
    (branches ?? [])[0] ??
    null;

  const fullName =
    typeof authData.user.user_metadata?.full_name === "string"
      ? authData.user.user_metadata.full_name
      : authData.user.email ?? "Usuario Blackbird";

  const organizationOptions = (organizations ?? [])
    .map((item) => ({
      id: item.id,
      name: item.trade_name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  const branchOptions = (branches ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    isMain: item.is_main,
    isVirtual: item.is_virtual,
  }));

  return {
    supabase,
    user: authData.user,
    fullName,
    membership,
    memberships,
    organization,
    branch,
    role,
    organizationOptions,
    branchOptions,
  };
}

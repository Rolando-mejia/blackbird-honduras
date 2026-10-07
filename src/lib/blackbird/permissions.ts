import type { SupabaseClient } from "@supabase/supabase-js";

export async function getRolePermissionKeys(
  supabase: SupabaseClient,
  role: { id: string; is_owner_role?: boolean | null } | null,
) {
  if (!role) return new Set<string>();

  if (role.is_owner_role) {
    const { data } = await supabase.from("permissions").select("key");
    return new Set((data ?? []).map((item) => item.key));
  }

  const { data } = await supabase
    .from("role_permissions")
    .select("permissions(key)")
    .eq("role_id", role.id);

  const keys = new Set<string>();

  for (const row of data ?? []) {
    const permission = Array.isArray(row.permissions)
      ? row.permissions[0]
      : row.permissions;

    if (permission?.key) keys.add(permission.key);
  }

  return keys;
}

export function can(
  permissions: Set<string>,
  permissionKey: string,
) {
  return permissions.has(permissionKey);
}

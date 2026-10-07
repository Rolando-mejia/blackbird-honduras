"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function safeReturnTo(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "/dashboard";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

export async function switchOrganization(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const returnTo = safeReturnTo(formData.get("returnTo"));

  if (organizationId) {
    const store = await cookies();
    store.set("bb_active_org", organizationId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    store.delete("bb_active_branch");
  }

  redirect(returnTo);
}

export async function switchBranch(formData: FormData) {
  const branchId = String(formData.get("branchId") ?? "");
  const returnTo = safeReturnTo(formData.get("returnTo"));

  if (branchId) {
    const store = await cookies();
    store.set("bb_active_branch", branchId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  redirect(returnTo);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getActiveContext } from "@/lib/blackbird/context";

function usersFail(message: string): never {
  redirect(`/usuarios?error=${encodeURIComponent(message)}`);
}

function usersSuccess(message: string, inviteToken?: string): never {
  const params = new URLSearchParams({ message });
  if (inviteToken) params.set("invite", inviteToken);
  redirect(`/usuarios?${params.toString()}`);
}

function mapUserError(message: string) {
  if (message.includes("USER_LIMIT_REACHED")) {
    return "Alcanzaste el límite de usuarios de tu plan.";
  }
  if (message.includes("USER_ALREADY_MEMBER")) {
    return "Ese correo ya pertenece a un usuario de esta empresa.";
  }
  if (message.includes("INVITATION_ALREADY_PENDING")) {
    return "Ya existe una invitación pendiente para ese correo.";
  }
  if (message.includes("BRANCH_REQUIRED")) {
    return "Selecciona al menos una sucursal para este usuario.";
  }
  if (message.includes("LAST_OWNER")) {
    return "No puedes quitar o suspender al último Propietario activo.";
  }
  if (message.includes("OWNER_ROLE_RESTRICTED")) {
    return "Solo un Propietario puede asignar el rol Propietario.";
  }
  if (message.includes("NOT_ALLOWED")) {
    return "Tu rol no tiene permiso para realizar esta acción.";
  }

  return "No pudimos completar la operación. Revisa los datos e inténtalo nuevamente.";
}

export async function createUserInvitation(formData: FormData) {
  const parsed = z
    .object({
      email: z.string().trim().email("Escribe un correo válido"),
      fullName: z.string().trim().min(2, "Escribe el nombre del usuario"),
      phone: z.string().trim().max(60).optional(),
      jobTitle: z.string().trim().max(160).optional(),
      roleId: z.string().uuid("Selecciona un rol"),
      allBranches: z.boolean(),
      branchIds: z.array(z.string().uuid()),
    })
    .safeParse({
      email: formData.get("email"),
      fullName: formData.get("fullName"),
      phone: String(formData.get("phone") ?? "") || undefined,
      jobTitle: String(formData.get("jobTitle") ?? "") || undefined,
      roleId: formData.get("roleId"),
      allBranches: formData.get("allBranches") === "true",
      branchIds: formData.getAll("branchIds"),
    });

  if (!parsed.success) {
    usersFail(parsed.error.issues[0]?.message ?? "Revisa los datos.");
  }

  const ctx = await getActiveContext();

  const { data, error } = await ctx.supabase.rpc(
    "create_blackbird_user_invitation",
    {
      p_organization_id: ctx.organization.id,
      p_email: parsed.data.email,
      p_full_name: parsed.data.fullName,
      p_phone: parsed.data.phone ?? "",
      p_job_title: parsed.data.jobTitle ?? "",
      p_role_id: parsed.data.roleId,
      p_all_branches: parsed.data.allBranches,
      p_branch_ids: parsed.data.branchIds,
    },
  );

  if (error) {
    console.error("Blackbird create invitation error", error);
    usersFail(mapUserError(error.message));
  }

  revalidatePath("/usuarios");
  revalidatePath("/auditoria");

  const token =
    data && typeof data === "object" && "token" in data
      ? String(data.token)
      : undefined;

  usersSuccess(
    "Invitación creada. Comparte el enlace seguro con la persona invitada.",
    token,
  );
}

export async function manageUserInvitation(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (!invitationId || !["revoke", "regenerate"].includes(action)) {
    usersFail("Invitación inválida.");
  }

  const ctx = await getActiveContext();
  const { data, error } = await ctx.supabase.rpc(
    "manage_blackbird_user_invitation",
    {
      p_invitation_id: invitationId,
      p_action: action,
    },
  );

  if (error) {
    console.error("Blackbird manage invitation error", error);
    usersFail(mapUserError(error.message));
  }

  revalidatePath("/usuarios");
  revalidatePath("/auditoria");

  const token =
    data && typeof data === "object" && "token" in data
      ? String(data.token)
      : undefined;

  if (action === "regenerate") {
    usersSuccess("Se generó un nuevo enlace de invitación.", token);
  }

  usersSuccess("La invitación fue revocada.");
}

export async function updateOrganizationMember(formData: FormData) {
  const parsed = z
    .object({
      memberId: z.string().uuid(),
      roleId: z.string().uuid(),
      jobTitle: z.string().trim().max(160).optional(),
      status: z.enum(["active", "suspended"]),
      allBranches: z.boolean(),
      branchIds: z.array(z.string().uuid()),
    })
    .safeParse({
      memberId: formData.get("memberId"),
      roleId: formData.get("roleId"),
      jobTitle: String(formData.get("jobTitle") ?? "") || undefined,
      status: formData.get("status"),
      allBranches: formData.get("allBranches") === "true",
      branchIds: formData.getAll("branchIds"),
    });

  if (!parsed.success) {
    usersFail(parsed.error.issues[0]?.message ?? "Revisa el acceso del usuario.");
  }

  const ctx = await getActiveContext();
  const { error } = await ctx.supabase.rpc(
    "update_blackbird_organization_member",
    {
      p_member_id: parsed.data.memberId,
      p_role_id: parsed.data.roleId,
      p_job_title: parsed.data.jobTitle ?? "",
      p_status: parsed.data.status,
      p_all_branches: parsed.data.allBranches,
      p_branch_ids: parsed.data.branchIds,
    },
  );

  if (error) {
    console.error("Blackbird update member error", error);
    usersFail(mapUserError(error.message));
  }

  revalidatePath("/usuarios");
  revalidatePath("/auditoria");
  usersSuccess("Acceso del usuario actualizado.");
}

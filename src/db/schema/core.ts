import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";

export const organizationStatus = pgEnum("organization_status", ["trial","active","suspended","cancelled"]);
export const membershipStatus = pgEnum("membership_status", ["invited","active","suspended"]);
export const organizationType = pgEnum("organization_type", ["sole_trader","company","independent_professional","ngo","other"]);

export const organizations = pgTable("organizations", {
  id: id(), legalName: varchar("legal_name", { length: 220 }).notNull(), tradeName: varchar("trade_name", { length: 220 }).notNull(), rtn: varchar("rtn", { length: 20 }), type: organizationType("type").default("company").notNull(), countryCode: varchar("country_code", { length: 2 }).default("HN").notNull(), currencyCode: varchar("currency_code", { length: 3 }).default("HNL").notNull(), timezone: varchar("timezone", { length: 64 }).default("America/Tegucigalpa").notNull(), status: organizationStatus("status").default("trial").notNull(), onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }), createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: timestamp("deleted_at", { withTimezone: true })
}, (table) => [uniqueIndex("organizations_rtn_uq").on(table.rtn), index("organizations_status_idx").on(table.status)]);

export const organizationSettings = pgTable("organization_settings", { id:id(), organizationId:uuid("organization_id").notNull().references(() => organizations.id,{onDelete:"cascade"}), settings:jsonb("settings").$type<Record<string,unknown>>().default({}).notNull(), createdAt:createdAt(), updatedAt:updatedAt() }, (table)=>[uniqueIndex("organization_settings_org_uq").on(table.organizationId)]);
export const appUsers = pgTable("app_users", { id:uuid("id").primaryKey(), email:varchar("email",{length:320}).notNull(), fullName:varchar("full_name",{length:180}).notNull(), phone:varchar("phone",{length:40}), createdAt:createdAt(), updatedAt:updatedAt() }, (table)=>[uniqueIndex("app_users_email_uq").on(table.email)]);
export const branches = pgTable("branches", { id:id(), organizationId:uuid("organization_id").notNull().references(()=>organizations.id,{onDelete:"cascade"}), name:varchar("name",{length:160}).notNull(), code:varchar("code",{length:30}).notNull(), address:text("address"), department:varchar("department",{length:100}), municipality:varchar("municipality",{length:100}), isMain:boolean("is_main").default(false).notNull(), isActive:boolean("is_active").default(true).notNull(), createdAt:createdAt(), updatedAt:updatedAt() }, (table)=>[uniqueIndex("branches_org_code_uq").on(table.organizationId,table.code),index("branches_org_idx").on(table.organizationId)]);
export const roles = pgTable("roles", { id:id(), organizationId:uuid("organization_id").references(()=>organizations.id,{onDelete:"cascade"}), name:varchar("name",{length:100}).notNull(), description:text("description"), isSystem:boolean("is_system").default(false).notNull(), createdAt:createdAt(), updatedAt:updatedAt() }, (table)=>[uniqueIndex("roles_org_name_uq").on(table.organizationId,table.name)]);
export const organizationMembers = pgTable("organization_members", { id:id(), organizationId:uuid("organization_id").notNull().references(()=>organizations.id,{onDelete:"cascade"}), userId:uuid("user_id").notNull().references(()=>appUsers.id,{onDelete:"cascade"}), roleId:uuid("role_id").references(()=>roles.id,{onDelete:"set null"}), status:membershipStatus("status").default("active").notNull(), joinedAt:timestamp("joined_at",{withTimezone:true}).defaultNow(), createdAt:createdAt(), updatedAt:updatedAt() }, (table)=>[uniqueIndex("organization_members_org_user_uq").on(table.organizationId,table.userId),index("organization_members_user_idx").on(table.userId)]);
export const permissions = pgTable("permissions", { id:id(), key:varchar("key",{length:180}).notNull(), moduleKey:varchar("module_key",{length:80}).notNull(), description:text("description"), createdAt:createdAt() }, (table)=>[uniqueIndex("permissions_key_uq").on(table.key)]);
export const rolePermissions = pgTable("role_permissions", { roleId:uuid("role_id").notNull().references(()=>roles.id,{onDelete:"cascade"}), permissionId:uuid("permission_id").notNull().references(()=>permissions.id,{onDelete:"cascade"}), grantedAt:timestamp("granted_at",{withTimezone:true}).defaultNow().notNull() }, (table)=>[uniqueIndex("role_permissions_role_permission_uq").on(table.roleId,table.permissionId)]);
export const auditLogs = pgTable("audit_logs", { id:id(), organizationId:uuid("organization_id").notNull().references(()=>organizations.id,{onDelete:"restrict"}), userId:uuid("user_id").references(()=>appUsers.id,{onDelete:"set null"}), action:varchar("action",{length:80}).notNull(), entityType:varchar("entity_type",{length:80}).notNull(), entityId:uuid("entity_id"), metadata:jsonb("metadata").$type<Record<string,unknown>>().default({}).notNull(), ipAddress:varchar("ip_address",{length:64}), userAgent:text("user_agent"), occurredAt:timestamp("occurred_at",{withTimezone:true}).defaultNow().notNull() }, (table)=>[index("audit_logs_org_time_idx").on(table.organizationId,table.occurredAt),index("audit_logs_entity_idx").on(table.entityType,table.entityId)]);

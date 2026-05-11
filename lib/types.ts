export type {
  Application,
  ApplicationStatus,
  AuditLog,
  Document,
  LicenseType,
  Permission,
  RequiredDocument,
  Role,
  User,
  UserRole,
} from "./api"

export type DocumentCategory = "general"
export type PermissionCategory = "applications" | "documents" | "users" | "roles" | "audit" | "workflow"

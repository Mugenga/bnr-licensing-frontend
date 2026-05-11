import axios, { AxiosError, AxiosResponse } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Token lives in browser storage, so add it only on client requests.
    const token = localStorage.getItem("auth_token")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const requestUrl = error.config?.url || ""
      const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register")
      const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/signup"

      if (isAuthRequest || isAuthPage) {
        // Login/signup need to show error in form, not refresh away.
        return Promise.reject(error)
      }

      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
      window.location.href = "/login" // clear bad session here.
    }
    return Promise.reject(error)
  },
)

export interface ApiErrorResponse {
  error: { message: string; code: string }
}

export interface ApiResponse<T> {
  data: T
}

export interface BackendListResponse<T> {
  data: T[]
  meta: { page: number; limit: number; total: number }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export type UserRole = "superadmin" | "applicant" | "officer" | "approver"

export interface Role {
  id: string
  name: UserRole | string
  description?: string
  isSystemRole?: boolean
  permissions: string[]
}

export interface User {
  id: string
  fullName: string
  email: string
  roleId: string
  roleName?: string
  role?: Role
  organization?: string
  organizationName?: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  organizationName: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface CreateUserRequest {
  fullName: string
  email: string
  password: string
  organizationName?: string
  roleId: string
  status?: "active" | "inactive"
}

export interface UpdateUserRequest {
  fullName?: string
  email?: string
  organizationName?: string
  roleId?: string
  status?: "active" | "inactive"
}

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "additional_documents_requested"
  | "resubmitted"
  | "pending_approval"
  | "approved"
  | "rejected"

export type LicenseType =
  | "Commercial Bank License"
  | "Microfinance License"
  | "Forex Bureau License"
  | "Mobile Money License"
  | "Insurance License"
  | string

export interface Application {
  id: string
  referenceNumber: string
  applicantUserId: string
  institutionName: string
  licenseType: LicenseType
  description?: string
  status: ApplicationStatus
  reviewedBy?: string
  reviewedAt?: string
  finalDecisionBy?: string
  finalDecisionAt?: string
  finalDecisionNote?: string
  version?: number
  createdAt: string
  updatedAt: string
}

export interface CreateApplicationRequest {
  institutionName: string
  licenseType: string
  description?: string
}

export interface Document {
  id: string
  applicationId: string
  uploadedBy: string
  originalName: string
  storedName: string
  documentType?: string
  mimeType: string
  sizeBytes: number
  version: number
  createdAt: string
}

export interface RequiredDocument {
  key: string
  label: string
}

export interface AuditLog {
  id: string
  applicationId: string
  actorUserId?: string
  action: string
  fromStatus?: ApplicationStatus
  toStatus?: ApplicationStatus
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface Permission {
  id: string
  name: string
  description?: string
  category?: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissionNames?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
}

function withTotalPages<T>(response: BackendListResponse<T>): PaginatedResponse<T> {
  return {
    data: response.data,
    meta: {
      ...response.meta,
      totalPages: Math.max(1, Math.ceil(response.meta.total / Math.max(response.meta.limit, 1))),
    },
  }
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post("/auth/login", credentials)
    return response.data.data
  },
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post("/auth/register", data)
    return response.data.data
  },
  me: async (): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.get("/auth/me")
    return response.data.data
  },
  logout: async (): Promise<void> => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  },
}

export interface ApplicationsQueryParams {
  status?: ApplicationStatus
  applicantUserId?: string
  page?: number
  limit?: number
}

export const applicationsApi = {
  list: async (params?: ApplicationsQueryParams): Promise<PaginatedResponse<Application>> => {
    const response: AxiosResponse<BackendListResponse<Application>> = await api.get("/applications", { params })
    return withTotalPages(response.data)
  },
  get: async (id: string): Promise<Application> => {
    const response: AxiosResponse<ApiResponse<Application>> = await api.get(`/applications/${id}`)
    return response.data.data
  },
  create: async (data: CreateApplicationRequest): Promise<Application> => {
    const response: AxiosResponse<ApiResponse<Application>> = await api.post("/applications", data)
    return response.data.data
  },
  getRequiredDocuments: async (licenseType: string): Promise<RequiredDocument[]> => {
    const response: AxiosResponse<ApiResponse<RequiredDocument[]>> = await api.get("/applications/required-documents", {
      params: { licenseType },
    })
    return response.data.data
  },
  getRequiredDocumentsConfig: async (): Promise<Record<string, RequiredDocument[]>> => {
    const response: AxiosResponse<ApiResponse<Record<string, RequiredDocument[]>>> = await api.get("/applications/required-documents")
    return response.data.data
  },
  setRequiredDocuments: async (licenseType: string, documents: RequiredDocument[]): Promise<RequiredDocument[]> => {
    const response: AxiosResponse<ApiResponse<RequiredDocument[]>> = await api.put("/applications/required-documents", { licenseType, documents })
    return response.data.data
  },
  submit: async (id: string): Promise<Application> => {
    const response: AxiosResponse<ApiResponse<Application>> = await api.patch(`/applications/${id}/submit`)
    return response.data.data
  },
  startReview: async (id: string): Promise<Application> => {
    const response: AxiosResponse<ApiResponse<Application>> = await api.patch(`/applications/${id}/review`)
    return response.data.data
  },
  requestDocuments: async (id: string, message: string): Promise<Application> => {
    const response: AxiosResponse<ApiResponse<Application>> = await api.patch(`/applications/${id}/request-documents`, { message })
    return response.data.data
  },
  resubmit: async (id: string): Promise<Application> => {
    const response: AxiosResponse<ApiResponse<Application>> = await api.patch(`/applications/${id}/resubmit`)
    return response.data.data
  },
  markPendingApproval: async (id: string): Promise<Application> => {
    const response: AxiosResponse<ApiResponse<Application>> = await api.patch(`/applications/${id}/pending-approval`)
    return response.data.data
  },
  approve: async (id: string, note: string): Promise<Application> => {
    const response: AxiosResponse<ApiResponse<Application>> = await api.patch(`/applications/${id}/approve`, { note })
    return response.data.data
  },
  reject: async (id: string, note: string): Promise<Application> => {
    const response: AxiosResponse<ApiResponse<Application>> = await api.patch(`/applications/${id}/reject`, { note })
    return response.data.data
  },
  getDocuments: async (applicationId: string): Promise<Document[]> => {
    const response: AxiosResponse<ApiResponse<Document[]>> = await api.get(`/applications/${applicationId}/documents`)
    return response.data.data
  },
  uploadDocuments: async (applicationId: string, files: File[] | { file: File; documentType?: string }[]): Promise<Document[]> => {
    const formData = new FormData()
    files.forEach((item) => {
      // Some uploads are general files, some are tied to required document keys.
      const file = item instanceof File ? item : item.file
      const documentType = item instanceof File ? undefined : item.documentType
      formData.append("documents", file)
      if (documentType) formData.append("documentTypes", documentType) // keep type aligned with file.
    })
    const response: AxiosResponse<ApiResponse<Document[]>> = await api.post(`/applications/${applicationId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data.data
  },
  getAuditLogs: async (applicationId: string): Promise<AuditLog[]> => {
    const response: AxiosResponse<ApiResponse<AuditLog[]>> = await api.get(`/applications/${applicationId}/audit-logs`)
    return response.data.data
  },
}

export const documentsApi = {
  download: async (documentId: string): Promise<Blob> => {
    const response = await api.get(`/documents/${documentId}/download`, { responseType: "blob" })
    return response.data
  },
}

export interface UsersQueryParams {
  page?: number
  limit?: number
}

export const usersApi = {
  list: async (params?: UsersQueryParams): Promise<PaginatedResponse<User>> => {
    const response: AxiosResponse<BackendListResponse<User>> = await api.get("/users", { params })
    return withTotalPages(response.data)
  },
  get: async (id: string): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.get(`/users/${id}`)
    return response.data.data
  },
  create: async (data: CreateUserRequest): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.post("/users", data)
    return response.data.data
  },
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.patch(`/users/${id}`, data)
    return response.data.data
  },
  updateStatus: async (id: string, status: "active" | "inactive"): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.patch(`/users/${id}/status`, { status })
    return response.data.data
  },
}

export const rolesApi = {
  list: async (): Promise<Role[]> => {
    const response: AxiosResponse<ApiResponse<Role[]>> = await api.get("/roles")
    return response.data.data
  },
  get: async (id: string): Promise<Role> => {
    const response: AxiosResponse<ApiResponse<Role>> = await api.get(`/roles/${id}`)
    return response.data.data
  },
  create: async (data: CreateRoleRequest): Promise<Role> => {
    const response: AxiosResponse<ApiResponse<Role>> = await api.post("/roles", data)
    return response.data.data
  },
  update: async (id: string, data: UpdateRoleRequest): Promise<Role> => {
    const response: AxiosResponse<ApiResponse<Role>> = await api.patch(`/roles/${id}`, data)
    return response.data.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`)
  },
  updatePermissions: async (id: string, permissionNames: string[]): Promise<Role> => {
    const response: AxiosResponse<ApiResponse<Role>> = await api.put(`/roles/${id}/permissions`, { permissionNames })
    return response.data.data
  },
}

export const permissionsApi = {
  list: async (): Promise<Permission[]> => {
    const response: AxiosResponse<ApiResponse<Permission[]>> = await api.get("/permissions")
    return response.data.data
  },
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return axiosError.response?.data?.error?.message || "Something went wrong. Please try again."
  }
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}

export default api

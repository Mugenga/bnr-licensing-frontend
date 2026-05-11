'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, User } from './api'

export type UserRole = 'superadmin' | 'applicant' | 'officer' | 'approver'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const userData = await authApi.me()
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData)) // keep local user fresh.
    } catch {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('auth_token')
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser)) // show cached user while token check.
      } catch {
        localStorage.removeItem('user')
      }
    }

    loadUser()
  }, [loadUser])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    localStorage.setItem('auth_token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login') // end local session.
  }, [router])

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user?.role?.permissions) return false
    return user.role.permissions.includes(permission)
  }, [user])

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!user?.role) return false
    const roles = Array.isArray(role) ? role : [role]
    const userRoleName = user.role.name.toLowerCase() as UserRole
    return roles.includes(userRoleName)
  }, [user])

  const refreshUser = useCallback(async () => {
    await loadUser()
  }, [loadUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function usePermissions() {
  const { hasPermission, hasRole, user } = useAuth()

  return {
    canCreateApplication: hasPermission('create_application'),
    canViewOwnApplications: hasPermission('view_own_applications'),
    canViewAllApplications: hasPermission('view_all_applications'),
    canReviewApplication: hasPermission('review_application'),
    canApproveApplication: hasPermission('approve_application'),
    canRejectApplication: hasPermission('reject_application'),
    canUploadDocuments: hasPermission('upload_documents'),
    canViewDocuments: hasPermission('view_documents'),
    canManageUsers: hasPermission('manage_users'),
    canManageRoles: hasPermission('manage_roles'),
    canViewAuditLogs: hasPermission('view_audit_logs'),
    isApplicant: hasRole('applicant'),
    isOfficer: hasRole('officer'),
    isApprover: hasRole('approver'),
    isSuperadmin: hasRole('superadmin'),
    userId: user?.id,
  }
}

'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Plus, Search, Shield, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { toast } from 'sonner'
import { getErrorMessage, permissionsApi, rolesApi } from '@/lib/api'
import type { Permission, Role } from '@/lib/types'

function permissionCategory(permission: Permission) {
  if (permission.name.includes('document')) return 'documents'
  if (permission.name.includes('user')) return 'users'
  if (permission.name.includes('role')) return 'roles'
  if (permission.name.includes('audit')) return 'audit'
  return 'applications'
}

export default function RolesPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [newRole, setNewRole] = useState({ name: '', description: '', permissionNames: [] as string[] })

  const rolesQuery = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list })
  const permissionsQuery = useQuery({ queryKey: ['permissions'], queryFn: permissionsApi.list })
  const roles = rolesQuery.data || []
  const permissions = permissionsQuery.data || []

  const filteredRoles = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return roles.filter((role) => role.name.toLowerCase().includes(query) || (role.description || '').toLowerCase().includes(query))
  }, [roles, searchQuery])

  const permissionsByCategory = useMemo(() => {
    return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
      const category = permissionCategory(permission)
      groups[category] = groups[category] || []
      groups[category].push(permission)
      return groups
    }, {})
  }, [permissions])

  const createMutation = useMutation({
    mutationFn: () => rolesApi.create(newRole),
    onSuccess: async () => {
      toast.success('Role created successfully')
      setShowCreateDialog(false)
      setNewRole({ name: '', description: '', permissionNames: [] })
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (roleId: string) => rolesApi.delete(roleId),
    onSuccess: async () => {
      toast.success('Role deleted')
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (rolesQuery.isLoading || permissionsQuery.isLoading) return <LoadingState message="Loading roles..." />
  if (rolesQuery.isError || permissionsQuery.isError) return <ErrorState title="Could not load roles" message="Please check that the backend is running." onRetry={() => { rolesQuery.refetch(); permissionsQuery.refetch() }} />

  const togglePermission = (permissionName: string) => {
    setNewRole((prev) => ({
      ...prev,
      permissionNames: prev.permissionNames.includes(permissionName)
        ? prev.permissionNames.filter((name) => name !== permissionName)
        : [...prev.permissionNames, permissionName],
    }))
  }

  const viewPermissions = (role: Role) => {
    setSelectedRole(role)
    setShowPermissionsDialog(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Roles & Permissions" description="Manage user roles and their associated permissions" actions={<Button onClick={() => setShowCreateDialog(true)}><Plus className="mr-2 h-4 w-4" />Add Role</Button>} />

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search roles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <p className="text-sm text-muted-foreground">{filteredRoles.length} role(s) found</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Role Name</TableHead><TableHead>Description</TableHead><TableHead>Permissions</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-secondary" />{role.name}</div></TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{role.description}</TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => viewPermissions(role)}><Badge variant="secondary">{role.permissions.length} permissions</Badge></Button></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewPermissions(role)}><Shield className="mr-2 h-4 w-4" />View Permissions</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(role.id)} disabled={role.isSystemRole}><Trash2 className="mr-2 h-4 w-4" />Delete Role</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Create New Role</DialogTitle><DialogDescription>Define a role with backend permissions. The backend blocks unsafe review plus approval combinations.</DialogDescription></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2"><Label htmlFor="roleName">Role Name</Label><Input id="roleName" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="roleDescription">Description</Label><Textarea id="roleDescription" value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} rows={2} /></div>
            <div className="space-y-4">
              <Label>Permissions</Label>
              {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                <Card key={category} className="p-4">
                  <h4 className="mb-3 font-medium capitalize">{category}</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox id={permission.id} checked={newRole.permissionNames.includes(permission.name)} onCheckedChange={() => togglePermission(permission.name)} />
                        <Label htmlFor={permission.id} className="cursor-pointer text-sm font-normal">{permission.name}</Label>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button><Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !newRole.name.trim()}>Create Role</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{selectedRole?.name} Permissions</DialogTitle><DialogDescription>{selectedRole?.description}</DialogDescription></DialogHeader>
          <div className="flex flex-wrap gap-2 py-4">
            {selectedRole?.permissions.length ? selectedRole.permissions.map((permission) => <Badge key={permission} variant="secondary">{permission}</Badge>) : <p className="text-sm text-muted-foreground">No permissions assigned.</p>}
          </div>
          <DialogFooter><Button onClick={() => setShowPermissionsDialog(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

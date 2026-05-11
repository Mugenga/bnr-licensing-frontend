'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Plus, Search, UserCheck, UserX } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { toast } from 'sonner'
import { formatDate } from '@/lib/status-utils'
import { getErrorMessage, rolesApi, usersApi } from '@/lib/api'
import type { User } from '@/lib/types'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newUser, setNewUser] = useState({ fullName: '', email: '', organizationName: '', roleId: '', password: '' })

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list({ page: 1, limit: 100 }) })
  const rolesQuery = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list })

  const users = usersQuery.data?.data || []
  const roles = rolesQuery.data || []
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return users.filter((user) =>
      user.email.toLowerCase().includes(query) ||
      user.fullName.toLowerCase().includes(query) ||
      (user.organizationName || '').toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  const createMutation = useMutation({
    mutationFn: () => usersApi.create({ ...newUser, status: 'active' }),
    onSuccess: async () => {
      toast.success('User created successfully')
      setShowCreateDialog(false)
      setNewUser({ fullName: '', email: '', organizationName: '', roleId: '', password: '' })
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const statusMutation = useMutation({
    mutationFn: ({ user, status }: { user: User; status: 'active' | 'inactive' }) => usersApi.updateStatus(user.id, status),
    onSuccess: async () => {
      toast.success('User status updated')
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (usersQuery.isLoading || rolesQuery.isLoading) return <LoadingState message="Loading users..." />
  if (usersQuery.isError || rolesQuery.isError) return <ErrorState title="Could not load users" message="Please check that the backend is running." onRetry={() => { usersQuery.refetch(); rolesQuery.refetch() }} />

  const handleToggleStatus = (user: User) => {
    statusMutation.mutate({ user, status: user.status === 'active' ? 'inactive' : 'active' })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users Management" description="Manage system users and their roles" actions={<Button onClick={() => setShowCreateDialog(true)}><Plus className="mr-2 h-4 w-4" />Add User</Button>} />

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <p className="text-sm text-muted-foreground">{filteredUsers.length} user(s) found</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{user.organizationName || '-'}</TableCell>
                  <TableCell><Badge variant="outline">{user.role?.name || user.roleName}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.status === 'active' ? <><UserX className="mr-2 h-4 w-4" />Deactivate</> : <><UserCheck className="mr-2 h-4 w-4" />Activate</>}
                        </DropdownMenuItem>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New User</DialogTitle><DialogDescription>Create a new user account and assign a role.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="organizationName">Organization</Label><Input id="organizationName" value={newUser.organizationName} onChange={(e) => setNewUser({ ...newUser, organizationName: e.target.value })} /></div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.roleId} onValueChange={(value) => setNewUser({ ...newUser, roleId: value })}>
                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>{roles.map((role) => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button><Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>Create User</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

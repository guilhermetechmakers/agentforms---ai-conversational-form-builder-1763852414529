import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreVertical,
  UserX,
  UserCheck,
  Eye,
  Ban,
  Trash2,
} from "lucide-react"
import { useUsers, useUserAction } from "@/hooks/useAdmin"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { UserActionDialog } from "./UserActionDialog"
import { UserDetailModal } from "./UserDetailModal"
import type { UserManagementUser } from "@/types/admin"

export function UserManagementSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "deleted">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<UserManagementUser | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"suspend" | "delete" | "restore" | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const pageSize = 20

  const { data: usersData, isLoading } = useUsers({
    search: searchQuery || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: currentPage,
    pageSize,
  })

  const userActionMutation = useUserAction()

  const users = usersData?.users || []
  const totalPages = usersData?.totalPages || 1

  const handleUserAction = (user: UserManagementUser, action: "suspend" | "delete" | "restore") => {
    setSelectedUser(user)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const confirmAction = async (reason?: string) => {
    if (!selectedUser || !actionType) return

    await userActionMutation.mutateAsync({
      user_id: selectedUser.id,
      action: actionType,
      reason,
    })

    setActionDialogOpen(false)
    setSelectedUser(null)
    setActionType(null)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">User Management</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            Manage users and organizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
              <Input
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(v: any) => {
                setRoleFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-[#282A30] border-[#303136]">
                <SelectItem value="all" className="text-[#F3F4F6]">All Roles</SelectItem>
                <SelectItem value="user" className="text-[#F3F4F6]">Users</SelectItem>
                <SelectItem value="admin" className="text-[#F3F4F6]">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v: any) => {
                setStatusFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#282A30] border-[#303136]">
                <SelectItem value="all" className="text-[#F3F4F6]">All Status</SelectItem>
                <SelectItem value="active" className="text-[#F3F4F6]">Active</SelectItem>
                <SelectItem value="suspended" className="text-[#F3F4F6]">Suspended</SelectItem>
                <SelectItem value="deleted" className="text-[#F3F4F6]">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-[#24262C]" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#F3F4F6] mb-2">
                No users found
              </h3>
              <p className="text-[#A1A1AA]">
                {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No users in the system"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-[#303136] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#303136] hover:bg-[#24262C]">
                      <TableHead className="text-[#A1A1AA]">User</TableHead>
                      <TableHead className="text-[#A1A1AA]">Role</TableHead>
                      <TableHead className="text-[#A1A1AA]">Status</TableHead>
                      <TableHead className="text-[#A1A1AA]">Organization</TableHead>
                      <TableHead className="text-[#A1A1AA]">Stats</TableHead>
                      <TableHead className="text-[#A1A1AA]">Joined</TableHead>
                      <TableHead className="text-[#A1A1AA] w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="border-[#303136] hover:bg-[#24262C]"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#F472B6]/20 flex items-center justify-center">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.full_name || user.email}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <span className="text-[#F472B6] font-semibold">
                                  {(user.full_name || user.email)[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[#F3F4F6]">
                                {user.full_name || "No name"}
                              </p>
                              <p className="text-sm text-[#A1A1AA]">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-[#F6D365]/20 text-[#F6D365]"
                                : "bg-[#60A5FA]/20 text-[#60A5FA]"
                            }`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.status === "active"
                                ? "bg-[#4ADE80]/20 text-[#4ADE80]"
                                : user.status === "suspended"
                                ? "bg-[#FBBF24]/20 text-[#FBBF24]"
                                : "bg-[#6B7280]/20 text-[#6B7280]"
                            }`}
                          >
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#A1A1AA]">
                          {user.organization?.name || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-[#A1A1AA]">
                          {user.total_agents || 0} agents, {user.total_sessions || 0} sessions
                        </TableCell>
                        <TableCell className="text-sm text-[#A1A1AA]">
                          {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#A1A1AA] hover:text-[#F3F4F6]"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-[#282A30] border-[#303136]"
                            >
                              <DropdownMenuItem
                                className="text-[#F3F4F6] focus:bg-[#24262C]"
                                onClick={() => {
                                  setSelectedUserId(user.id)
                                  setDetailModalOpen(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#303136]" />
                              {user.status === "active" ? (
                                <DropdownMenuItem
                                  className="text-[#FBBF24] focus:bg-[#24262C] focus:text-[#FBBF24]"
                                  onClick={() => handleUserAction(user, "suspend")}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend
                                </DropdownMenuItem>
                              ) : user.status === "suspended" ? (
                                <DropdownMenuItem
                                  className="text-[#4ADE80] focus:bg-[#24262C] focus:text-[#4ADE80]"
                                  onClick={() => handleUserAction(user, "restore")}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Restore
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuItem
                                className="text-[#F87171] focus:bg-[#24262C] focus:text-[#F87171]"
                                onClick={() => handleUserAction(user, "delete")}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-[#303136]">
                  <div className="text-sm text-[#A1A1AA]">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, usersData?.total || 0)} of{" "}
                    {usersData?.total || 0} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-[#303136] text-[#F3F4F6] hover:bg-[#282A30] disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-[#303136] text-[#F3F4F6] hover:bg-[#282A30] disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Action Dialog */}
      {selectedUser && actionType && (
        <UserActionDialog
          open={actionDialogOpen}
          onOpenChange={setActionDialogOpen}
          user={selectedUser}
          action={actionType}
          onConfirm={confirmAction}
        />
      )}

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          open={detailModalOpen}
          onOpenChange={(open) => {
            setDetailModalOpen(open)
            if (!open) {
              setSelectedUserId(null)
            }
          }}
          userId={selectedUserId}
        />
      )}
    </div>
  )
}

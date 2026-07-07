"use client";

import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { CircleUser, Crown, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAdmin } from "@/lib/admin-context";
import { authClient } from "@/lib/auth-client";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
};

export default function AccessControlPage() {
  const { role: userRole, canManageAccess } = useAdmin();
  const adminUsers = useQuery(api.adminUsers.list);
  const addUser = useMutation(api.adminUsers.add);
  const removeUser = useMutation(api.adminUsers.remove);
  const updateRole = useMutation(api.adminUsers.updateRole);
  const transferOwnership = useMutation(api.adminUsers.transferOwnership);
  const { data: session } = authClient.useSession();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager">("manager");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const confirmTransfer = async () => {
    if (!selectedTargetId || !session?.user?.id) return;
    const targetUser = adminUsers?.find((u) => u._id === selectedTargetId);
    if (!targetUser) return;

    const msg = `Are you absolutely sure you want to transfer ownership to ${targetUser.name}?\n\nWARNING: You will be demoted to an Admin and lose access control configuration rights. This action cannot be undone.`;
    if (!confirm(msg)) return;

    setIsTransferring(true);
    try {
      await transferOwnership({
        targetId: selectedTargetId as Id<"adminUsers">,
        ownerUserId: session.user.id,
      });
      alert(`Ownership successfully transferred to ${targetUser.name}!`);
      setTransferDialogOpen(false);
      setSelectedTargetId("");
    } catch (err: any) {
      const msg =
        err instanceof ConvexError
          ? err.data
          : err.message || "Failed to transfer ownership";
      alert(msg);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleAdd = async () => {
    if (!newEmail || !newName || !session?.user?.id) return;
    setIsSubmitting(true);
    try {
      await addUser({
        email: newEmail,
        name: newName,
        role: newRole,
        addedBy: session.user.id,
      });
      setDialogOpen(false);
      setNewEmail("");
      setNewName("");
      setNewRole("manager");
    } catch (err: any) {
      const msg =
        err instanceof ConvexError
          ? err.data
          : err.message || "Failed to add user";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: Id<"adminUsers">) => {
    if (!confirm("Remove this team member's access?")) return;
    try {
      await removeUser({ id });
    } catch (err: any) {
      const msg =
        err instanceof ConvexError
          ? err.data
          : err.message || "Failed to remove user";
      alert(msg);
    }
  };

  const handleRoleChange = async (
    id: Id<"adminUsers">,
    role: "admin" | "manager",
  ) => {
    try {
      await updateRole({ id, role });
    } catch (err: any) {
      const msg =
        err instanceof ConvexError
          ? err.data
          : err.message || "Failed to update role";
      alert(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-neutral-800 font-serif">
              Access Control
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Manage who can access the admin panel and their permissions.
            </p>
          </div>
        </div>

        {canManageAccess && (
          <div className="flex items-center gap-2.5">
            {/* Transfer Ownership Dialog */}
            <Dialog
              open={transferDialogOpen}
              onOpenChange={setTransferDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 border-amber-250 bg-amber-50/50 hover:bg-amber-100 hover:text-amber-700 text-amber-700 cursor-pointer font-medium shadow-sm transition-all duration-200"
                >
                  <Crown className="w-4 h-4 text-amber-600" />
                  Transfer Ownership
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-sidebar border border-neutral-300 dark:border-neutral-700 shadow-2xl rounded-2xl">
                <DialogHeader className="space-y-1">
                  <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-neutral-800 font-serif flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500 animate-pulse" />
                    Transfer Store Ownership
                  </DialogTitle>
                </DialogHeader>
                <Separator className="bg-neutral-200 dark:bg-neutral-800" />
                <div className="space-y-4 pt-1">
                  {/* Warning Alert Box */}
                  <div className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/15 text-amber-800 dark:text-amber-300 text-xs leading-relaxed font-medium">
                    <p>
                      <strong>WARNING:</strong> This action is immediate and
                      cannot be undone. You will be demoted to an **Admin** and
                      lose all owner-only control privileges.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                      Select New Owner
                    </label>
                    {adminUsers &&
                    adminUsers.filter((u) => u.role !== "owner").length ===
                      0 ? (
                      <div className="text-xs text-neutral-400 py-3 text-center border border-dashed rounded-lg">
                        No team members available to receive ownership.
                      </div>
                    ) : (
                      <Select
                        value={selectedTargetId}
                        onValueChange={setSelectedTargetId}
                      >
                        <SelectTrigger className="w-full bg-card h-10 rounded-xl">
                          <SelectValue placeholder="Choose a team member..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {adminUsers
                            ?.filter((u) => u.role !== "owner")
                            .map((u) => (
                              <SelectItem
                                key={u._id}
                                value={u._id}
                                className="rounded-lg"
                              >
                                {u.name} ({ROLE_LABELS[u.role] ?? u.role})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <Button
                    className="w-full rounded-xl cursor-pointer bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-10 mt-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={confirmTransfer}
                    disabled={
                      isTransferring ||
                      !selectedTargetId ||
                      (adminUsers &&
                        adminUsers.filter((u) => u.role !== "owner").length ===
                          0)
                    }
                  >
                    {isTransferring
                      ? "Transferring…"
                      : "Confirm & Transfer Ownership"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Team Member Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                      Name
                    </label>
                    <Input
                      placeholder="Employee name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                      Email
                    </label>
                    <Input
                      placeholder="employee@email.com"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Employee must have an account on upharVilla first.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                      Role
                    </label>
                    <Select
                      value={newRole}
                      onValueChange={(v) =>
                        setNewRole(v as "admin" | "manager")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          Admin — Full access (no access control)
                        </SelectItem>
                        <SelectItem value="manager">
                          Manager — View + manage orders only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full rounded-xl cursor-pointer"
                    onClick={handleAdd}
                    disabled={isSubmitting || !newEmail || !newName}
                  >
                    {isSubmitting ? "Adding…" : "Add Team Member"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Team Members Table */}
      <div className="border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b">
              <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Team Member
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">
                Added
              </th>
              {canManageAccess && (
                <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {adminUsers === undefined ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                </td>
              </tr>
            ) : adminUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-neutral-400 text-sm"
                >
                  No team members yet.
                </td>
              </tr>
            ) : (
              adminUsers.map((user) => {
                const label = ROLE_LABELS[user.role] ?? user.role;

                const isCurrentUser =
                  user.userId === session?.user?.id ||
                  user.email === session?.user?.email;

                return (
                  <tr
                    key={user._id}
                    className="border-b last:border-b-0 hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CircleUser
                          className="w-9 h-9 text-neutral-300 flex-shrink-0"
                          strokeWidth={1.5}
                        />
                        <div>
                          <p className="font-semibold text-sm text-neutral-800">
                            {user.name}
                            {isCurrentUser && (
                              <span className="ml-1.5 text-[10px] font-medium text-neutral-400">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {canManageAccess && user.role !== "owner" ? (
                        <Select
                          value={user.role}
                          onValueChange={(v) =>
                            handleRoleChange(user._id, v as "admin" | "manager")
                          }
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs font-semibold text-primary">
                          {label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-xs text-neutral-400">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    {canManageAccess && (
                      <td className="px-5 py-4 text-right">
                        {user.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-300 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
                            onClick={() => handleRemove(user._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Permission Matrix */}
      <div className="border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b bg-neutral-50">
          <h3 className="font-semibold text-neutral-800 text-sm">
            Permission Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-5 py-3 font-medium text-neutral-400 text-xs uppercase tracking-wider">
                  Feature
                </th>
                <th className="text-center px-4 py-3 font-medium text-neutral-400 text-xs uppercase tracking-wider">
                  Owner
                </th>
                <th className="text-center px-4 py-3 font-medium text-neutral-400 text-xs uppercase tracking-wider">
                  Admin
                </th>
                <th className="text-center px-4 py-3 font-medium text-neutral-400 text-xs uppercase tracking-wider">
                  Manager
                </th>
              </tr>
            </thead>
            <tbody className="text-neutral-600">
              {[
                ["Dashboard", true, true, "view"],
                ["Orders (view)", true, true, true],
                ["Orders (update status)", true, true, true],
                ["Orders (cancel/delete)", true, true, false],
                ["Inventory (view)", true, true, "view"],
                ["Inventory (add/edit/delete)", true, true, false],
                ["Content Management", true, true, false],
                ["Access Control", true, "view", false],
              ].map(([feature, owner, admin, manager]) => (
                <tr
                  key={feature as string}
                  className="border-b last:border-b-0"
                >
                  <td className="px-5 py-2.5 text-sm font-medium text-neutral-700">
                    {feature as string}
                  </td>
                  <td className="text-center px-4 py-2.5">
                    <PermCell value={owner} />
                  </td>
                  <td className="text-center px-4 py-2.5">
                    <PermCell value={admin} />
                  </td>
                  <td className="text-center px-4 py-2.5">
                    <PermCell value={manager} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PermCell({ value }: { value: string | boolean }) {
  if (value === true)
    return <span className="text-primary font-bold text-sm">✓</span>;
  if (value === "view")
    return <span className="text-neutral-400 text-xs font-medium">View</span>;
  return <span className="text-neutral-300 text-sm">—</span>;
}

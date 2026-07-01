"use client";

import { useMutation, useQuery } from "convex/react";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { api } from "../../convex/_generated/api";

export type AdminRole = "owner" | "admin" | "manager" | null;

interface AdminContextType {
  role: AdminRole;
  isLoading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canManageAccess: boolean; // Only owner
  canEditInventory: boolean; // Owner + Admin
  canEditContent: boolean; // Owner + Admin
  canUpdateOrders: boolean; // All roles
}

const AdminContext = createContext<AdminContextType>({
  role: null,
  isLoading: true,
  isOwner: false,
  isAdmin: false,
  isManager: false,
  canManageAccess: false,
  canEditInventory: false,
  canEditContent: false,
  canUpdateOrders: false,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const email = session?.user?.email;
  const name = session?.user?.name;

  const role = useQuery(
    api.adminUsers.getMyRole,
    userId ? { userId, email: email || undefined } : "skip",
  ) as AdminRole | undefined;

  const ensureFirstOwner = useMutation(api.adminUsers.ensureFirstOwner);

  useEffect(() => {
    if (role === null && userId && email && name) {
      ensureFirstOwner({ userId, email, name }).catch((err) => {
        console.error("Failed to automatically claim ownership:", err);
      });
    }
  }, [role, userId, email, name, ensureFirstOwner]);

  const isLoading = userId ? role === undefined : false;
  const resolvedRole = userId ? (role ?? null) : null;

  const value: AdminContextType = {
    role: resolvedRole,
    isLoading,
    isOwner: resolvedRole === "owner",
    isAdmin: resolvedRole === "admin",
    isManager: resolvedRole === "manager",
    canManageAccess: resolvedRole === "owner",
    canEditInventory: resolvedRole === "owner" || resolvedRole === "admin",
    canEditContent: resolvedRole === "owner" || resolvedRole === "admin",
    canUpdateOrders:
      resolvedRole === "owner" ||
      resolvedRole === "admin" ||
      resolvedRole === "manager",
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}

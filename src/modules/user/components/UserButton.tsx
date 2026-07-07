"use client";

import { Heart, LogOut, ShoppingBag, User } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export const UserButton = () => {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center cursor-pointer outline-none group select-none">
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-full border border-neutral-200/80 overflow-hidden flex items-center justify-center shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-primary/10">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "Profile"}
                className="h-full w-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : session.user.name ? (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm md:text-base select-none">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="h-full w-full bg-neutral-50 flex items-center justify-center text-neutral-600 hover:text-primary transition-colors">
                <User className="h-4.5 w-4.5 md:h-5 md:w-5" />
              </div>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => router.push("/account")}
        >
          <User className="h-4 w-4" />
          <span>Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => router.push("/my-orders")}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>My Orders</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => router.push("/wishlist")}
        >
          <Heart className="h-4 w-4" />
          <span>Wishlist</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => authClient.signOut()}
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;

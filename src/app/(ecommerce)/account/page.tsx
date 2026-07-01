"use client";

import {
  Calendar,
  ChevronRight,
  Heart,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function AccountPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Authentication guard: Redirect to /auth if not logged in
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth");
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to log out");
      setIsLoggingOut(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#faf9ff] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-neutral-500 font-semibold font-mono">
          Verifying your session...
        </p>
      </div>
    );
  }

  // Format join date if available
  const joinDate = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-[#faf9ff] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-neutral-800">My Account</h1>
        </div>

        {/* User Card with Premium Details */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-white border border-neutral-100 p-6 sm:p-8 shadow-sm"
        >
          {/* Subtle Top Accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center text-primary shadow-sm shrink-0 overflow-hidden">
              <User className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
            </div>

            {/* User Meta */}
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 tracking-tight truncate leading-tight">
                {session.user.name}
              </h1>
              <p className="text-sm sm:text-base text-neutral-500 font-mono font-medium truncate flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                {session.user.email}
              </p>
              <p className="text-xs text-neutral-400 font-mono font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Member since {joinDate}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "My Orders",
              description: "Track, return, or buy items again",
              icon: ShoppingBag,
              href: "/my-orders",
            },
            {
              title: "Wishlist",
              description: "View and manage your saved items",
              icon: Heart,
              href: "/wishlist",
            },
            {
              title: "Shopping Cart",
              description: "Proceed to checkout or review items",
              icon: ShoppingCart,
              href: "/cart",
            },
            {
              title: "Contact Support",
              description: "Get assistance with your orders",
              icon: Mail,
              href: "/contact",
            },
          ].map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Link
                  href={card.href}
                  className="flex items-center gap-4 group h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-neutral-800 group-hover:text-primary transition-colors truncate">
                      {card.title}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono font-medium truncate mt-0.5">
                      {card.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Actions card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2.5 text-xs text-neutral-400 font-mono font-semibold text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Your personal data and account details are fully secured
            </span>
          </div>

          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full sm:w-auto bg-neutral-50 hover:bg-neutral-100/80 text-neutral-600 border border-neutral-200/60 rounded-xl px-6 py-5 font-bold text-sm shadow-none transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Log Out Account
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

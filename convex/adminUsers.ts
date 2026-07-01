import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Get current user's admin role — lightweight, returns only the role string.
 *  Uses .first() on indexed fields — cheapest possible read (1 document). */
export const getMyRole = query({
  args: { userId: v.string(), email: v.optional(v.string()) },
  handler: async (ctx, { userId, email }) => {
    const byId = await ctx.db
      .query("adminUsers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (byId) return byId.role;

    // Fallback by email — only runs if userId didn't match
    if (email) {
      const byEmail = await ctx.db
        .query("adminUsers")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      if (byEmail) return byEmail.role;
    }

    return null;
  },
});

/** List admin users — only returns fields needed by the UI.
 *  Avoids sending full documents to reduce bandwidth costs. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("adminUsers").order("desc").collect();
    return all.map(({ _id, userId, email, name, role, createdAt }) => ({
      _id,
      userId,
      email,
      name,
      role,
      createdAt,
    }));
  },
});

/** Add admin user — resolves userId server-side so client sends minimal data */
export const add = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("manager")),
    addedBy: v.string(),
  },
  handler: async (ctx, { email, name, role, addedBy }) => {
    // Index lookup — 1 read max
    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) throw new Error("This user already has admin access.");

    // Index lookup — 1 read max
    const user = await ctx.db
      .query("user")
      .withIndex("email_name", (q) => q.eq("email", email))
      .first();
    if (!user) {
      throw new Error(
        "No account found with this email. They must sign up first.",
      );
    }

    // 1 write
    const res = await ctx.db.insert("adminUsers", {
      userId: user._id,
      email,
      name,
      role,
      addedBy,
      createdAt: Date.now(),
    });

    // Queue welcome team member email
    await ctx.db.insert("emailsQueue", {
      to: [{ email, name }],
      subject: "Welcome to the UpharVilla Team!",
      htmlContent: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 12px;"><h2 style="color: #6d28d9; margin-top: 0;">Welcome to UpharVilla!</h2><p>Hi <strong>${name}</strong>,</p><p>You have been added as a <strong>${role.toUpperCase()}</strong> to the UpharVilla Admin Panel.</p><p>You can now log in using your account to view and manage orders or catalog items based on your permissions.</p><br/><p>Best regards,<br/>The UpharVilla Team</p></div>`,
      status: "pending",
      retries: 0,
      createdAt: Date.now(),
    });

    return res;
  },
});

/** Remove admin user — 1 read + 1 delete */
export const remove = mutation({
  args: { id: v.id("adminUsers") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Admin user not found.");
    if (doc.role === "owner") throw new Error("Cannot remove the Owner.");
    await ctx.db.delete(id);
  },
});

/** Update role — 1 read + 1 patch */
export const updateRole = mutation({
  args: {
    id: v.id("adminUsers"),
    role: v.union(v.literal("admin"), v.literal("manager")),
  },
  handler: async (ctx, { id, role }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Admin user not found.");
    if (doc.role === "owner")
      throw new Error("Cannot change the Owner's role.");
    await ctx.db.patch(id, { role });
  },
});

/** Automatically claim Owner role if this is the first ever user registered in the database */
export const ensureFirstOwner = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { userId, email, name }) => {
    // 1. Find the first ever registered user in the main user table (ascending order gets oldest first)
    const firstUser = await ctx.db.query("user").first();
    if (!firstUser) return null;

    // 2. Check if an Owner is already registered in the adminUsers table
    const existingOwner = await ctx.db
      .query("adminUsers")
      .withIndex("by_role", (q) => q.eq("role", "owner"))
      .first();

    // 3. If no Owner is registered, and this caller is the first user in the user database, register them as the Owner
    if (!existingOwner && firstUser._id === userId) {
      await ctx.db.insert("adminUsers", {
        userId,
        email,
        name,
        role: "owner",
        addedBy: "system",
        createdAt: Date.now(),
      });
      return "owner";
    }
    return null;
  },
});

/** Transfer ownership to another team member. The caller must be the current Owner. */
export const transferOwnership = mutation({
  args: {
    targetId: v.id("adminUsers"),
    ownerUserId: v.string(),
  },
  handler: async (ctx, { targetId, ownerUserId }) => {
    // Find current owner
    const currentOwner = await ctx.db
      .query("adminUsers")
      .withIndex("by_userId", (q) => q.eq("userId", ownerUserId))
      .first();

    if (currentOwner?.role !== "owner") {
      throw new Error("Only the current Owner can transfer ownership.");
    }

    const targetUser = await ctx.db.get(targetId);
    if (!targetUser) {
      throw new Error("Target team member not found.");
    }
    if (targetUser.role === "owner") {
      throw new Error("Target is already the Owner.");
    }

    // Demote current owner to admin, promote target to owner
    await ctx.db.patch(currentOwner._id, { role: "admin" });
    await ctx.db.patch(targetUser._id, { role: "owner" });

    // Queue email to target (new owner)
    await ctx.db.insert("emailsQueue", {
      to: [{ email: targetUser.email, name: targetUser.name }],
      subject: "Store Ownership Transferred to You - UpharVilla",
      htmlContent: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 12px;"><h2 style="color: #d97706; margin-top: 0;">Congratulations!</h2><p>Hi <strong>${targetUser.name}</strong>,</p><p>You have been promoted to the <strong>Owner</strong> of UpharVilla.</p><p>You now have full owner-level administration privileges, including access control and permission management.</p><br/><p>Best regards,<br/>The UpharVilla Team</p></div>`,
      status: "pending",
      retries: 0,
      createdAt: Date.now(),
    });

    // Queue email to previous owner (demoted to admin)
    await ctx.db.insert("emailsQueue", {
      to: [{ email: currentOwner.email, name: currentOwner.name }],
      subject: "Ownership Transferred Successfully - UpharVilla",
      htmlContent: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 12px;"><h2 style="color: #6b7280; margin-top: 0;">Ownership Transferred</h2><p>Hi <strong>${currentOwner.name}</strong>,</p><p>You have successfully transferred ownership of UpharVilla to <strong>${targetUser.name}</strong>.</p><p>Your role has been updated to <strong>Admin</strong>.</p><br/><p>Best regards,<br/>The UpharVilla Team</p></div>`,
      status: "pending",
      retries: 0,
      createdAt: Date.now(),
    });

    return true;
  },
});

import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { TableNames } from "./_generated/dataModel";

export async function getTableCount(
  ctx: GenericQueryCtx<any>,
  tableName: TableNames,
): Promise<number> {
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_table", (q) => q.eq("table", tableName))
    .unique();

  if (counter !== null) {
    return counter.count;
  }

  // Fallback to manual count if not initialized yet
  const items = await ctx.db.query(tableName).collect();
  return items.length;
}

export async function incrementCounter(
  ctx: GenericMutationCtx<any>,
  tableName: TableNames,
): Promise<void> {
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_table", (q) => q.eq("table", tableName))
    .unique();

  if (counter !== null) {
    await ctx.db.patch(counter._id, { count: counter.count + 1 });
  } else {
    // Self-healing initialization: count current items, add 1, and save
    const items = await ctx.db.query(tableName).collect();
    await ctx.db.insert("counters", {
      table: tableName,
      count: items.length + 1,
    });
  }
}

export async function decrementCounter(
  ctx: GenericMutationCtx<any>,
  tableName: TableNames,
): Promise<void> {
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_table", (q) => q.eq("table", tableName))
    .unique();

  if (counter !== null) {
    await ctx.db.patch(counter._id, { count: Math.max(0, counter.count - 1) });
  } else {
    // Self-healing initialization: count current items, subtract 1, and save
    const items = await ctx.db.query(tableName).collect();
    await ctx.db.insert("counters", {
      table: tableName,
      count: Math.max(0, items.length - 1),
    });
  }
}

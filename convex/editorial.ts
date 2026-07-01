import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getEditorialGrid = query({
  args: {},
  handler: async (_ctx) => {
    return null;
  },
});

export const updateEditorialGrid = mutation({
  args: {
    slot1: v.any(),
    slot2: v.any(),
    slot3: v.any(),
    slot4: v.any(),
    slot5: v.any(),
  },
  handler: async (_ctx, _args) => {
    return null;
  },
});

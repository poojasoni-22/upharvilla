"use client";

import { useMutation, useQuery } from "convex/react";
import { CalendarHeart, Info, Menu, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "../../../../../convex/_generated/api";

const SECTION_PRESETS = [
  // ── Milestones ──
  { label: "Birthday", slug: "birthday" },
  { label: "Anniversary", slug: "anniversary" },
  { label: "Wedding", slug: "wedding" },
  { label: "Engagement", slug: "engagement" },
  { label: "Graduation", slug: "graduation" },
  { label: "Retirement", slug: "retirement" },
  { label: "Baby Shower", slug: "baby-shower" },
  // ── Love & Family ──
  { label: "Valentine's Day", slug: "valentines-day" },
  { label: "Mother's Day", slug: "mothers-day" },
  { label: "Father's Day", slug: "fathers-day" },
  { label: "Women's Day", slug: "womens-day" },
  { label: "Karwa Chauth", slug: "karwa-chauth" },
  { label: "Bhai Dooj", slug: "bhai-dooj" },
  { label: "Friendship Day", slug: "friendship-day" },
  { label: "Children's Day", slug: "childrens-day" },
  { label: "Teacher's Day", slug: "teachers-day" },
  // ── Festive & Events ──
  { label: "Rakhi", slug: "rakhi" },
  { label: "Diwali", slug: "diwali" },
  { label: "Holi", slug: "holi" },
  { label: "Christmas", slug: "christmas" },
  { label: "New Year", slug: "new-year" },
  { label: "Eid", slug: "eid" },
  { label: "Navratri", slug: "navratri" },
  { label: "Onam", slug: "onam" },
  { label: "Pongal", slug: "pongal" },
  { label: "Lohri", slug: "lohri" },
  { label: "Ganesh Chaturthi", slug: "ganesh-chaturthi" },
  { label: "Housewarming", slug: "housewarming" },
  // ── Sentiments ──
  { label: "Gratitude & Appreciation", slug: "thank-you" },
  { label: "Celebrations & Achievements", slug: "congratulations" },
  { label: "Care & Recovery", slug: "get-well-soon" },
  { label: "Apology & Reconciliation", slug: "sorry" },
];

// ─── Auto-categorize occasion slugs into navbar heading groups ───────────────
const SLUG_TO_HEADING: Record<string, string> = {
  // Milestones
  birthday: "Milestones",
  anniversary: "Milestones",
  wedding: "Milestones",
  engagement: "Milestones",
  graduation: "Milestones",
  retirement: "Milestones",
  "baby-shower": "Milestones",
  // Love & Family
  "valentines-day": "Love & Family",
  "mothers-day": "Love & Family",
  "fathers-day": "Love & Family",
  "womens-day": "Love & Family",
  "karwa-chauth": "Love & Family",
  "bhai-dooj": "Love & Family",
  "friendship-day": "Love & Family",
  "childrens-day": "Love & Family",
  "teachers-day": "Love & Family",
  // Festive & Events
  rakhi: "Festive & Events",
  diwali: "Festive & Events",
  holi: "Festive & Events",
  christmas: "Festive & Events",
  "new-year": "Festive & Events",
  eid: "Festive & Events",
  navratri: "Festive & Events",
  onam: "Festive & Events",
  pongal: "Festive & Events",
  lohri: "Festive & Events",
  "ganesh-chaturthi": "Festive & Events",
  housewarming: "Festive & Events",
  // Sentiments
  "thank-you": "Sentiments",
  congratulations: "Sentiments",
  "get-well-soon": "Sentiments",
  sorry: "Sentiments",
};

export function OccasionManager() {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState("0");

  const occasions = useQuery(api.occasions.getOccasions);
  const createOccasion = useMutation(api.occasions.createOccasion);
  const deleteOccasion = useMutation(api.occasions.deleteOccasion);

  const activeTabs = occasions ?? [];

  // Add homepage section tab
  const handleAddSectionTab = async () => {
    const preset = SECTION_PRESETS[parseInt(selectedPresetIdx, 10)];
    if (!preset) return;

    if (activeTabs.some((t) => t.slug === preset.slug)) {
      toast.error(`"${preset.label}" is already added.`);
      return;
    }

    toast.promise(
      createOccasion({
        label: preset.label,
        slug: preset.slug,
        icon: "",
      }),
      {
        loading: `Adding "${preset.label}" tab...`,
        success: `"${preset.label}" tab added!`,
        error: "Failed to add tab.",
      },
    );
  };

  // Delete homepage section tab
  const handleDeleteTab = async (occItem: any) => {
    if (!occItem._id) return;
    toast.promise(deleteOccasion({ id: occItem._id }), {
      loading: `Removing "${occItem.label}"...`,
      success: `"${occItem.label}" removed!`,
      error: "Failed to remove.",
    });
  };

  // Build navbar preview from active tabs
  const navbarPreview = (() => {
    const headings = [
      "Milestones",
      "Love & Family",
      "Festive & Events",
      "Sentiments",
    ];
    return headings
      .map((heading) => ({
        heading,
        links: activeTabs
          .filter(
            (o) => (SLUG_TO_HEADING[o.slug] || "Festive & Events") === heading,
          )
          .map((o) => o.label),
      }))
      .filter((cat) => cat.links.length > 0);
  })();

  return (
    <div className="space-y-10">
      {/* ─── HOMEPAGE TABS MANAGER ─── */}
      <div className="border border-border rounded-xl p-6 bg-white space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarHeart className="h-5 w-5 text-primary" />
            Shop by Occasion (Homepage Tabs)
          </h2>

          {/* Simple Dropdown + Add button */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPresetIdx}
              onChange={(e) => setSelectedPresetIdx(e.target.value)}
              className="flex h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {SECTION_PRESETS.map((p, idx) => (
                <option key={idx} value={idx}>
                  {p.label}
                </option>
              ))}
            </select>
            <Button
              onClick={handleAddSectionTab}
              size="sm"
              className="gap-1.5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        {/* Current Active Tabs List */}
        {occasions === undefined ? (
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
        ) : activeTabs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No occasions added yet. Use the dropdown above to add.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {activeTabs.map((occ, idx) => (
              <div
                key={occ._id || idx}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-4 pr-1 py-1.5 rounded-full text-sm font-medium hover:bg-slate-100/70 transition-all"
              >
                <span className="text-slate-800">{occ.label}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive hover:bg-destructive/10 rounded-full cursor-pointer flex items-center justify-center"
                  onClick={() => handleDeleteTab(occ)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── NAVBAR MEGA MENU PREVIEW (auto-synced, read-only) ─── */}
      <div className="border border-border rounded-xl p-6 bg-white space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Menu className="h-5 w-5 text-primary" />
            Navbar Mega Menu
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 font-medium">
            <Info className="h-3 w-3" />
            Auto-synced from Homepage Tabs
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          The navbar dropdown automatically updates when you add or remove
          occasions above. Each occasion is categorized into one of three
          groups:
        </p>

        {navbarPreview.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Add occasions above to see the navbar preview.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {navbarPreview.map((cat) => (
              <div
                key={cat.heading}
                className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 space-y-3"
              >
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                  {cat.heading}
                </h3>
                <div className="space-y-1.5">
                  {cat.links.map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-none" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

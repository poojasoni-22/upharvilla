import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PREMIUM_COLORS: Record<string, string> = {
  // Reds
  red: "#be123c", // Elegant ruby / rose gold crimson
  crimson: "#9f1239",
  ruby: "#e11d48",
  burgundy: "#881337",

  // Blues
  blue: "#1d4ed8", // Deep cobalt / sapphire blue
  navy: "#1e3a8a",
  indigo: "#4f46e5",
  sky: "#38bdf8",
  teal: "#0d9488",
  cyan: "#06b6d4",

  // Greens
  green: "#15803d", // Rich forest/emerald green
  emerald: "#059669",
  sage: "#86efac",
  olive: "#3f6212",
  mint: "#a7f3d0",

  // Yellows / Golds
  yellow: "#d97706", // Warm amber / gold yellow
  yelloe: "#d97706", // Typo fallback
  gold: "#d4af37",
  mustard: "#ca8a04",
  amber: "#f59e0b",

  // Oranges / Browns
  orange: "#ea580c",
  tangerine: "#f97316",
  brown: "#78350f",
  bronze: "#cd7f32",
  copper: "#b87333",

  // Pinks
  pink: "#db2777",
  rose: "#fda4af",
  salmon: "#fa8072",
  coral: "#f43f5e",

  // Purples
  purple: "#7c3aed",
  violet: "#6d28d9",
  lavender: "#ad8de9",
  plum: "#581c87",

  // Neutrals / Earth tones
  beige: "#d6c5b3", // Warm desert sand / beige
  cream: "#f5f2eb", // Soft linen cream
  ivory: "#fafaf0",
  sand: "#e5c290",
  khaki: "#c3b091",
  taupe: "#483c32",

  // Blacks & Grays
  black: "#171717", // Matte Obsidian Black
  charcoal: "#262626",
  gray: "#737373",
  grey: "#737373",
  silver: "#cbd5e1",
  white: "#fafafa",
};

export function getPremiumColor(colorName: string): string {
  const clean = colorName.trim().toLowerCase();
  if (
    clean.startsWith("#") ||
    clean.startsWith("rgb") ||
    clean.startsWith("hsl")
  ) {
    return colorName;
  }
  return PREMIUM_COLORS[clean] || colorName;
}

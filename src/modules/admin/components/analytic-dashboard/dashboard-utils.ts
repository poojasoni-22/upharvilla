// ═══════════════════════════════════════════════════
// SHARED TYPES, CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════

export interface DashboardStats {
  totalRevenue: number;
  totalOrdersCount: number;
  totalEnquiriesCount: number;
  lowStockCount: number;
  last7DaysSales: { date: string; amount: number; count: number }[];
  orderStatusBreakdown: { status: string; count: number; revenue: number }[];
  inventoryByCategory: {
    category: string;
    totalProducts: number;
    healthy: number;
    lowStock: number;
    outOfStock: number;
    stockUnits: number;
  }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

export interface AdvancedStats {
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  revenueByCategory: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
  dailyOrderVolume: { date: string; count: number; revenue: number }[];
  aovWeekly: { week: string; aov: number; orders: number }[];
  overallAOV: number;
  couponPerformance: {
    code: string;
    redemptions: number;
    totalDiscount: number;
  }[];
  ratingDistribution: { rating: number; count: number }[];
  totalReviews: number;
  heatmapData: { hour: number; dayOfWeek: string; count: number }[];
  paymentStatusBreakdown: { status: string; count: number }[];
  recentActivity: { type: string; description: string; time: number }[];
  revenueGrowth: { current: number; previous: number; growthPercent: number };
}

export const EMPTY_STATS: DashboardStats = {
  totalRevenue: 0,
  totalOrdersCount: 0,
  totalEnquiriesCount: 0,
  lowStockCount: 0,
  last7DaysSales: [],
  orderStatusBreakdown: [],
  inventoryByCategory: [],
  topProducts: [],
};

export const EMPTY_ADVANCED: AdvancedStats = {
  monthlyRevenue: [],
  revenueByCategory: [],
  dailyOrderVolume: [],
  aovWeekly: [],
  overallAOV: 0,
  couponPerformance: [],
  ratingDistribution: [],
  totalReviews: 0,
  heatmapData: [],
  paymentStatusBreakdown: [],
  recentActivity: [],
  revenueGrowth: { current: 0, previous: 0, growthPercent: 0 },
};

export const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const CATEGORY_LABELS: Record<string, string> = {
  "customized-gifts": "Customized",
  "corporate-gifts": "Corporate",
  hampers: "Hampers",
  "frames-bouquet": "Frames",
  "shop-by-occasion": "Occasion",
  "new-arrivals": "New arrivals",
};

export const STATUS_COLORS = [
  "#ad8de9",
  "#6366f1",
  "#14b8a6",
  "#10b981",
  "#f43f5e",
];
export const DONUT_COLORS = [
  "#ad8de9",
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#f43f5e",
  "#10b981",
];
export const RATING_COLORS = [
  "#f43f5e",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
];
export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "#10b981",
  pending: "#f59e0b",
  failed: "#f43f5e",
};

export const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid #f3f4f6",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  fontSize: "11px",
};

export function formatCurrency(value: unknown) {
  return typeof value === "number"
    ? `₹${value.toLocaleString("en-IN")}`
    : `₹${String(value)}`;
}

export function formatCompactCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function timeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

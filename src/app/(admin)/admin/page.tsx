"use client";

import { useQuery } from "convex/react";
import { AlertTriangle, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  AOVTrendChart,
  CategoryRevenueChart,
  CouponPerformance,
  DailyVolumeChart,
  EMPTY_ADVANCED,
  EMPTY_STATS,
  FulfillmentPipeline,
  InventoryHealth,
  KPICards,
  OrderHeatmap,
  PaymentStatus,
  PendingActionsBanner,
  RecentActivity,
  RevenueChart,
  ReviewRatings,
  TopProductsTable,
} from "@/modules/admin/components/analytic-dashboard";
import { api } from "../../../../convex/_generated/api";

// ═══════════════════════════════════════════════════
// ADMIN DASHBOARD PAGE
// ═══════════════════════════════════════════════════

export default function AdminHomePage() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const stats = useQuery(api.orders.getStats);

  const [revenueRange, setRevenueRange] = useState("7d");

  // ── Normalize stats with fallbacks ──
  const dashboardStats = stats
    ? {
        totalRevenue: stats.totalRevenue ?? 0,
        totalOrdersCount: stats.totalOrdersCount ?? 0,
        totalEnquiriesCount: stats.totalEnquiriesCount ?? 0,
        lowStockCount: stats.lowStockCount ?? 0,
        last7DaysSales: stats.last7DaysSales ?? [],
        orderStatusBreakdown: stats.orderStatusBreakdown ?? [],
        inventoryByCategory: stats.inventoryByCategory ?? [],
        topProducts: stats.topProducts ?? [],
      }
    : EMPTY_STATS;

  const advanced = stats
    ? {
        monthlyRevenue: stats.monthlyRevenue ?? EMPTY_ADVANCED.monthlyRevenue,
        revenueByCategory:
          stats.revenueByCategory ?? EMPTY_ADVANCED.revenueByCategory,
        dailyOrderVolume:
          stats.dailyOrderVolume ?? EMPTY_ADVANCED.dailyOrderVolume,
        aovWeekly: stats.aovWeekly ?? EMPTY_ADVANCED.aovWeekly,
        overallAOV: stats.overallAOV ?? 0,
        couponPerformance:
          stats.couponPerformance ?? EMPTY_ADVANCED.couponPerformance,
        ratingDistribution:
          stats.ratingDistribution ?? EMPTY_ADVANCED.ratingDistribution,
        totalReviews: stats.totalReviews ?? 0,
        heatmapData: stats.heatmapData ?? EMPTY_ADVANCED.heatmapData,
        paymentStatusBreakdown:
          stats.paymentStatusBreakdown ?? EMPTY_ADVANCED.paymentStatusBreakdown,
        recentActivity: stats.recentActivity ?? EMPTY_ADVANCED.recentActivity,
        revenueGrowth: stats.revenueGrowth ?? EMPTY_ADVANCED.revenueGrowth,
      }
    : EMPTY_ADVANCED;

  // ── Derived data for revenue chart ──
  const revenueChartData =
    revenueRange === "7d"
      ? dashboardStats.last7DaysSales.map((d) => ({
          label: d.date,
          revenue: d.amount,
          orders: d.count,
        }))
      : revenueRange === "30d"
        ? advanced.dailyOrderVolume.map((d) => ({
            label: d.date,
            revenue: d.revenue,
            orders: d.count,
          }))
        : advanced.monthlyRevenue.map((d) => ({
            label: d.month,
            revenue: d.revenue,
            orders: d.orders,
          }));

  // ── Pending actions data ──
  const pendingOrders =
    dashboardStats.orderStatusBreakdown.find((s) => s.status === "placed")
      ?.count ?? 0;
  const outOfStockCount = dashboardStats.inventoryByCategory.reduce(
    (s, c) => s + c.outOfStock,
    0,
  );

  // ── Access guard ──
  if (!isSessionPending && !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-neutral-800">Access Denied</h2>
        <p className="text-sm text-neutral-500 max-w-sm text-center">
          Please log in with an administrator account to view dashboard metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-1 sm:px-4 pb-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-start gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
              Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Overview of revenue, orders, inventory, and customer insights.
            </p>
          </div>
        </div>
      </div>

      {/* ── Alerts + Quick Actions ── */}
      <PendingActionsBanner
        pendingOrders={pendingOrders}
        outOfStockCount={outOfStockCount}
        lowStockCount={dashboardStats.lowStockCount}
        enquiriesCount={dashboardStats.totalEnquiriesCount}
      />

      {/* ── KPI Cards ── */}
      <KPICards
        totalRevenue={dashboardStats.totalRevenue}
        totalOrdersCount={dashboardStats.totalOrdersCount}
        overallAOV={advanced.overallAOV}
        enquiriesCount={dashboardStats.totalEnquiriesCount}
        lowStockCount={dashboardStats.lowStockCount}
        revenueGrowthPercent={advanced.revenueGrowth.growthPercent}
      />

      {/* ── Revenue & Orders Chart ── */}
      <RevenueChart
        revenueRange={revenueRange}
        onRangeChange={setRevenueRange}
        chartData={revenueChartData}
      />

      {/* ── Category Revenue + Daily Volume ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CategoryRevenueChart revenueByCategory={advanced.revenueByCategory} />
        <DailyVolumeChart dailyOrderVolume={advanced.dailyOrderVolume} />
      </div>

      {/* ── Pipeline + Inventory + Top Products ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <FulfillmentPipeline
          orderStatusBreakdown={dashboardStats.orderStatusBreakdown}
        />
        <InventoryHealth
          inventoryByCategory={dashboardStats.inventoryByCategory}
        />
        <TopProductsTable topProducts={dashboardStats.topProducts} />
      </div>

      {/* ── Coupons + AOV Trend + Ratings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CouponPerformance couponPerformance={advanced.couponPerformance} />
        <AOVTrendChart
          aovWeekly={advanced.aovWeekly}
          overallAOV={advanced.overallAOV}
        />
        <ReviewRatings
          ratingDistribution={advanced.ratingDistribution}
          totalReviews={advanced.totalReviews}
        />
      </div>

      {/* ── Heatmap + Payment Status ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <OrderHeatmap heatmapData={advanced.heatmapData} />
        <PaymentStatus
          paymentStatusBreakdown={advanced.paymentStatusBreakdown}
        />
      </div>

      {/* ── Recent Activity ── */}
      <RecentActivity recentActivity={advanced.recentActivity} />
    </div>
  );
}

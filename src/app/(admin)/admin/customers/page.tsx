"use client";

import {
  ArrowTurnDownIcon,
  MoneyReceiveSquareIcon,
  ShoppingBag01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePaginatedQuery } from "convex/react";
import { Mail, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "../../../../../convex/_generated/api";

const ITEMS_PER_PAGE = 25;

function formatCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDate(timestamp: number) {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type SortKey = "newest" | "oldest" | "spend" | "orders";

export default function CustomersManagementPage() {
  const {
    results: customers,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.orders.listCustomersPaginated,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const processed = useMemo(() => {
    if (!customers) return [];
    let filtered = customers;

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
      );
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "spend":
        sorted.sort((a, b) => b.totalSpend - a.totalSpend);
        break;
      case "orders":
        sorted.sort((a, b) => b.orderCount - a.orderCount);
        break;
      default:
        sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
    return sorted;
  }, [customers, debouncedSearch, sortBy]);

  const stats = useMemo(() => {
    if (!customers || customers.length === 0) {
      return { total: 0, withOrders: 0, totalRevenue: 0, avgLTV: 0 };
    }
    const withOrders = customers.filter((c) => c.orderCount > 0);
    const totalRevenue = customers.reduce((s, c) => s + c.totalSpend, 0);
    return {
      total: customers.length,
      withOrders: withOrders.length,
      totalRevenue,
      avgLTV: withOrders.length > 0 ? totalRevenue / withOrders.length : 0,
    };
  }, [customers]);

  const selectedCustomer = processed.find((c) => c._id === selectedId);

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex flex-col lg:h-[calc(100vh-80px)] px-1 sm:px-4 pt-2 gap-4">
        <div className="flex items-start gap-2">
          <Users className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
              Customers
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[72px] bg-neutral-50 rounded-2xl border border-neutral-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-80px)] px-1 sm:px-4 pt-2 lg:overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 shrink-0">
        <div className="flex items-start gap-2">
          <Users className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
              Customers
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              View all registered customers, their orders, and lifetime value.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 shrink-0 animate-in fade-in duration-300">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={UserMultiple02Icon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Total Customers
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {stats.total}
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Paying Customers
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {stats.withOrders}
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={MoneyReceiveSquareIcon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={ArrowTurnDownIcon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Avg. LTV
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {formatCurrency(stats.avgLTV)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b border-neutral-200/60 pb-2.5 mt-4 shrink-0">
        <div className="flex items-center gap-0.5">
          {(
            [
              { key: "newest", label: "Newest" },
              { key: "spend", label: "Top Spend" },
              { key: "orders", label: "Most Orders" },
              { key: "oldest", label: "Oldest" },
            ] as { key: SortKey; label: string }[]
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortBy(opt.key)}
              className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 -mb-[1px] cursor-pointer ${
                sortBy === opt.key
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center pb-1.5">
          <Search className="absolute left-2.5 w-3 h-3 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-neutral-50/50 border-neutral-200/70 h-7 text-xs w-full sm:w-56 rounded-lg focus-visible:ring-1 focus-visible:ring-[#ad8de9] focus-visible:border-[#ad8de9] placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Customer List + Detail — fills remaining viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-3 min-h-0 flex-1 pb-4">
        {/* Table with internal scroll */}
        <div className="lg:col-span-3 min-h-0 flex flex-col">
          {processed.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 border border-dashed border-neutral-200 rounded-xl">
              <HugeiconsIcon
                icon={UserMultiple02Icon}
                className="w-12 h-12 text-neutral-300 mb-4"
              />
              <h3 className="text-sm font-medium text-neutral-500">
                No customers found
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {search ? "Try a different search term." : "No customers yet."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col min-h-0 flex-1">
              {/* Sticky table header */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-sm">
                    <tr className="border-b border-neutral-100">
                      <th className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider py-2.5 px-4 w-8">
                        #
                      </th>
                      <th className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider py-2.5 px-4">
                        Customer
                      </th>
                      <th className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider py-2.5 px-3 text-center">
                        Orders
                      </th>
                      <th className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider py-2.5 px-3 text-right">
                        Total Spend
                      </th>
                      <th className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider py-2.5 px-4 text-right hidden sm:table-cell">
                        Joined
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-neutral-50">
                    {processed.map((customer, index) => (
                      <tr
                        key={customer._id}
                        onClick={() => setSelectedId(customer._id)}
                        className={`group cursor-pointer transition-colors ${
                          selectedId === customer._id
                            ? "bg-[#ad8de9]/[0.04]"
                            : "hover:bg-neutral-50/50"
                        }`}
                      >
                        <td className="py-2.5 px-4 w-8">
                          <span className="text-[10px] font-bold text-neutral-300 font-mono">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold text-neutral-500 uppercase">
                                {customer.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-neutral-800 truncate">
                                {customer.name}
                              </p>
                              <p className="text-[10px] text-neutral-400 truncate">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-xs font-bold font-mono tabular-nums ${
                              customer.orderCount > 0
                                ? "text-neutral-800"
                                : "text-neutral-300"
                            }`}
                          >
                            {customer.orderCount}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`text-xs font-bold font-mono tabular-nums ${
                              customer.totalSpend > 0
                                ? "text-neutral-800"
                                : "text-neutral-300"
                            }`}
                          >
                            {customer.totalSpend > 0
                              ? formatCurrency(customer.totalSpend)
                              : "₹0"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right hidden sm:table-cell">
                          <span className="text-[10px] text-neutral-400">
                            {formatDate(customer.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {status === "CanLoadMore" && !debouncedSearch.trim() && (
                  <div className="p-2.5 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => loadMore(ITEMS_PER_PAGE)}
                      className="w-full py-2 rounded-lg border border-neutral-200/70 bg-neutral-50/50 text-[11px] font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
                    >
                      Load more
                    </button>
                  </div>
                )}

                {status === "Exhausted" && processed.length > 0 && (
                  <div className="py-2 text-center">
                    <span className="text-[10px] text-neutral-300 font-medium">
                      Showing all {processed.length} customers
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2 min-h-0 flex flex-col">
          {selectedCustomer ? (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-500 uppercase">
                    {selectedCustomer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-800">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    Joined {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedCustomer.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-600 hover:text-primary truncate"
                >
                  {selectedCustomer.email}
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                    Orders
                  </p>
                  <p className="text-lg font-extrabold text-neutral-800 font-mono mt-0.5">
                    {selectedCustomer.orderCount}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                    Total Spent
                  </p>
                  <p className="text-lg font-extrabold text-neutral-800 font-mono mt-0.5">
                    {formatCurrency(selectedCustomer.totalSpend)}
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Last Order
                </p>
                <p className="text-xs font-semibold text-neutral-700 mt-0.5">
                  {selectedCustomer.lastOrderAt
                    ? formatDate(selectedCustomer.lastOrderAt)
                    : "No orders yet"}
                </p>
              </div>

              <div>
                {selectedCustomer.orderCount > 1 ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">
                    Repeat Buyer
                  </span>
                ) : selectedCustomer.orderCount === 1 ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#ad8de9]">
                    First-Time Buyer
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    No Purchases
                  </span>
                )}
              </div>

              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedCustomer.email}&su=${encodeURIComponent("Hello from upharVilla")}&body=${encodeURIComponent(`Hi ${selectedCustomer.name},\n\n`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Send Email
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-8 flex flex-col items-center justify-center text-center flex-1">
              <Users className="w-10 h-10 text-neutral-200 mb-3" />
              <p className="text-sm font-medium text-neutral-500">
                Select a customer
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Click on any row to view details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

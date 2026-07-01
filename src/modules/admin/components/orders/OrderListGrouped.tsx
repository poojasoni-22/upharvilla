"use client";

import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  CreditCard,
  Download,
  Eye,
  IndianRupee,
  Loader2,
  ShoppingBag,
  User,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface OrderListGroupedProps {
  orders: any[];
  onStatusChange: (orderId: string, newStatus: any) => Promise<void>;
  onOpenDetails: (order: any) => void;
  isUpdating: string | null;
  getPaymentBadge: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
  onDownloadInvoice?: (order: any) => void;
  isDownloadingId?: string | null;
}

type OrderStatus =
  | "placed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const STATUS_ACCENT: Record<OrderStatus, string> = {
  placed: "bg-[#ad8de9]",
  shipped: "bg-sky-500",
  out_for_delivery: "bg-amber-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-neutral-400",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const Th = ({
  icon: Icon,
  label,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
}) => (
  <TableHead className={`border-b border-l first:border-l-0 ${className}`}>
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Icon size={12} className="shrink-0" />
      {label}
    </span>
  </TableHead>
);

export function OrderListGrouped({
  orders,
  onStatusChange,
  onOpenDetails,
  isUpdating,
  getPaymentBadge,
  getStatusBadge,
  onDownloadInvoice,
  isDownloadingId,
}: OrderListGroupedProps) {
  const statuses: OrderStatus[] = [
    "placed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
          <ShoppingBag
            size={32}
            className="text-neutral-200 dark:text-neutral-700 mb-2"
          />
          <p className="text-sm font-medium text-neutral-500">
            No orders found
          </p>
          <p className="text-xs text-neutral-455 mt-0.5">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        statuses.map((status) => {
          const statusOrders = orders.filter((o) => o.orderStatus === status);

          return (
            <StatusGroup
              key={status}
              status={status}
              orders={statusOrders}
              onOpenDetails={onOpenDetails}
              onStatusChange={onStatusChange}
              isUpdating={isUpdating}
              getPaymentBadge={getPaymentBadge}
              getStatusBadge={getStatusBadge}
              onDownloadInvoice={onDownloadInvoice}
              isDownloadingId={isDownloadingId}
            />
          );
        })
      )}
    </div>
  );
}

interface StatusGroupProps {
  status: OrderStatus;
  orders: any[];
  onOpenDetails: (order: any) => void;
  onStatusChange: (orderId: string, newStatus: any) => Promise<void>;
  isUpdating: string | null;
  getPaymentBadge: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
  onDownloadInvoice?: (order: any) => void;
  isDownloadingId?: string | null;
}

function StatusGroup({
  status,
  orders,
  onOpenDetails,
  onStatusChange,
  isUpdating,
  getPaymentBadge,
  getStatusBadge,
  onDownloadInvoice,
  isDownloadingId,
}: StatusGroupProps) {
  // Collapse by default at first
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div>
      {/* Group Header */}
      <div
        className="flex items-center justify-between mb-3 px-4 dark:bg-neutral-800 bg-neutral-200/55 py-1.5 rounded-md cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 w-full">
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground bg-muted rounded transition-transform duration-200",
              !isExpanded && "-rotate-90",
            )}
          />
          <div
            className={cn(
              "w-1 h-5 rounded-full shrink-0",
              STATUS_ACCENT[status],
            )}
          />
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
            {STATUS_LABELS[status]}
            <span className="text-[10px] font-medium text-muted-foreground dark:bg-muted bg-neutral-100 px-1.5 py-0.5 rounded">
              {orders.length}
            </span>
          </h2>
        </div>
      </div>

      {/* Group Content (Animated Table) */}
      {isExpanded && (
        <div
          className="table-scroll-x w-full animate-in fade-in slide-in-from-top-1 duration-200"
          style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
        >
          <Table className="border-t border-b dark:border-neutral-700 border-neutral-200 min-w-[1100px]">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-9 border-b text-[10px] font-semibold text-muted-foreground text-center">
                  #
                </TableHead>
                <Th icon={Calendar} label="Order / Date" />
                <Th icon={User} label="Customer" />
                <Th icon={ShoppingBag} label="Items" />
                <Th icon={IndianRupee} label="Total" />
                <Th icon={CreditCard} label="Payment" />
                <Th icon={CircleDot} label="Status" />
                <TableHead className="w-24 text-center border-b border-l">
                  <span className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Zap size={12} />
                    Actions
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.length === 0 ? (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-xs text-muted-foreground italic"
                  >
                    No orders in this status stage.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order, idx) => (
                  <TableRow
                    key={order._id}
                    className="group cursor-pointer dark:hover:bg-neutral-900 hover:bg-muted/30 transition-all duration-150"
                    onClick={() => onOpenDetails(order)}
                  >
                    {/* Row Number */}
                    <TableCell className="border-b text-center text-[10px] font-medium text-neutral-450 dark:text-neutral-500 tabular-nums w-9">
                      {startIndex + idx + 1}
                    </TableCell>

                    {/* Order / Date */}
                    <TableCell className="border-b border-l">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono text-xs">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar size={10} className="text-neutral-400" />
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="border-b border-l">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                          {order.user?.name || "Guest User"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {order.user?.email}
                        </span>
                      </div>
                    </TableCell>

                    {/* Items */}
                    <TableCell className="border-b border-l font-medium text-neutral-800 dark:text-neutral-200 tabular-nums">
                      {order.items.reduce(
                        (sum: number, item: any) => sum + item.quantity,
                        0,
                      )}{" "}
                      pcs
                    </TableCell>

                    {/* Total */}
                    <TableCell className="border-b border-l font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell className="border-b border-l">
                      {getPaymentBadge(order.paymentStatus)}
                    </TableCell>

                    {/* Order Status */}
                    <TableCell className="border-b border-l">
                      {isUpdating === order._id ? (
                        <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        getStatusBadge(order.orderStatus)
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      className="text-center border-b border-l"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => onOpenDetails(order)}
                          className="h-6 w-6 rounded-md text-neutral-455 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          <Eye size={14} />
                        </Button>
                        {onDownloadInvoice && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => onDownloadInvoice(order)}
                            disabled={isDownloadingId === order._id}
                            className="h-6 w-6 rounded-md text-neutral-455 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                          >
                            {isDownloadingId === order._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download size={14} />
                            )}
                          </Button>
                        )}
                        <Select
                          value={order.orderStatus}
                          onValueChange={(val) =>
                            onStatusChange(order._id, val)
                          }
                        >
                          <SelectTrigger className="h-6 w-[100px] text-[10px] rounded-md bg-neutral-50 border-neutral-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placed">Placed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="out_for_delivery">
                              Out for Delivery
                            </SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-neutral-50/50 dark:bg-neutral-900/30">
              <p className="text-[11px] text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(startIndex + ITEMS_PER_PAGE, orders.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {orders.length}
                </span>{" "}
                items
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="h-6 w-6 rounded-md bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800 disabled:opacity-40"
                >
                  <ChevronLeft size={12} />
                </Button>
                <span className="text-[10px] text-muted-foreground">
                  Page{" "}
                  <span className="font-semibold text-foreground">
                    {safePage}
                  </span>{" "}
                  of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safePage >= totalPages}
                  className="h-6 w-6 rounded-md bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800 disabled:opacity-40"
                >
                  <ChevronRight size={12} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

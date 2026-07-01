"use client";

import {
  Calendar,
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

interface OrderTableProps {
  orders: any[];
  onStatusChange: (orderId: string, newStatus: any) => Promise<void>;
  onOpenDetails: (order: any) => void;
  isUpdating: string | null;
  getPaymentBadge: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

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

export function OrderTable({
  orders,
  onStatusChange,
  onOpenDetails,
  isUpdating,
  getPaymentBadge,
  getStatusBadge,
  onDownloadInvoice,
  isDownloadingId,
}: OrderTableProps & {
  onDownloadInvoice?: (order: any) => void;
  isDownloadingId?: string | null;
}) {
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
    <>
      <div className="rounded-xl border bg-card/70 backdrop-blur-sm mt-2">
        <div
          className="table-scroll-x"
          style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
        >
          <Table className="min-w-[1100px]">
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
              {paginatedOrders.map((order, idx) => (
                <TableRow
                  key={order._id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => onOpenDetails(order)}
                >
                  <TableCell className="border-b text-center text-[10px] font-medium text-neutral-400 dark:text-neutral-550 tabular-nums w-9">
                    {startIndex + idx + 1}
                  </TableCell>

                  <TableCell className="border-b border-l">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono text-xs">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar size={10} className="text-neutral-400" />
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </TableCell>

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

                  <TableCell className="border-b border-l font-medium text-neutral-800 dark:text-neutral-200 tabular-nums">
                    {order.items.reduce(
                      (sum: number, item: any) => sum + item.quantity,
                      0,
                    )}{" "}
                    pcs
                  </TableCell>

                  <TableCell className="border-b border-l font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </TableCell>

                  <TableCell className="border-b border-l">
                    {getPaymentBadge(order.paymentStatus)}
                  </TableCell>

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
                        onValueChange={(val) => onStatusChange(order._id, val)}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 bg-background/90 backdrop-blur-md border px-4 py-2.5 rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {startIndex + 1}–
                {Math.min(startIndex + ITEMS_PER_PAGE, orders.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {orders.length}
              </span>
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="h-7 w-7 hover:bg-muted/50"
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-xs text-muted-foreground px-1 tabular-nums">
                <span className="font-semibold text-foreground">
                  {safePage}
                </span>
                {" / "}
                {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage >= totalPages}
                className="h-7 w-7 hover:bg-muted/50"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

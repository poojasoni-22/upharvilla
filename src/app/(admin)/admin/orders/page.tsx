"use client";

import {
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  CreditCardIcon,
  ListViewIcon,
  Loading03Icon,
  Location01Icon,
  RupeeIcon,
  Search01Icon,
  ShoppingBag01Icon,
  TableIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "convex/react";
import { Download, Loader2, ShoppingBag } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TableHead } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { OrderListGrouped } from "@/modules/admin/components/orders/OrderListGrouped";
import { OrderTable } from "@/modules/admin/components/orders/OrderTable";
import InvoiceTemplate from "@/modules/user/components/my-orders/InvoiceTemplate";
import { api } from "../../../../../convex/_generated/api";

function InvoiceTemplatePortal({ displayItem }: { displayItem: any }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <InvoiceTemplate displayItem={displayItem} />,
    document.body,
  );
}

function ItemThumbnail({ storageId }: { storageId: string }) {
  const isDirectUrl = storageId.startsWith("http");
  const imageUrl =
    useQuery(api.products.getImageUrl, !isDirectUrl ? { storageId } : "skip") ||
    (isDirectUrl ? storageId : null);

  return (
    <div className="h-full w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Product"
          className="h-full w-full object-cover"
        />
      ) : (
        <HugeiconsIcon
          icon={ShoppingBag01Icon}
          size={16}
          className="text-neutral-400"
        />
      )}
    </div>
  );
}

const _Th = ({
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

export default function AdminOrdersPage() {
  const liveOrders = useQuery(api.orders.list);
  const updateStatus = useMutation(api.orders.updateStatus);

  const [view, setView] = useState<"list" | "table">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [downloadingOrder, setDownloadingOrder] = useState<any>(null);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);

  const handleDownloadInvoice = async (order: any) => {
    try {
      setIsDownloadingId(order._id);
      setDownloadingOrder(order);

      // Give a slightly longer timeout for portal content and images to fully load
      await new Promise((resolve) => setTimeout(resolve, 600));

      const element = document.getElementById(`invoice-capture-${order._id}`);
      if (!element) {
        throw new Error("Invoice template not found in DOM");
      }

      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.jsPDF;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas rendering returned empty dimensions");
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const canvasWidth = canvas.width || 794;
      const canvasHeight = canvas.height || 1123;
      const imgHeight = (canvasHeight * imgWidth) / canvasWidth;

      if (Number.isNaN(imgHeight) || imgHeight <= 0) {
        throw new Error("Invalid canvas heights calculated");
      }

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

      // Generate Blob instead of base64 dataURL to bypass Chrome's size limit blocks
      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Invoice_Order_${order._id.slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the Object URL to free memory
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);

      toast.success("Invoice PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF invoice. Please try again.");
    } finally {
      setIsDownloadingId(null);
      setDownloadingOrder(null);
    }
  };

  const displayItemForInvoice = useMemo(() => {
    if (!downloadingOrder) return null;
    return {
      orderId: downloadingOrder._id,
      itemId: downloadingOrder._id,
      item: {
        productId: downloadingOrder.items[0]?.productId || "",
        name: downloadingOrder.items[0]?.name || "",
        price: downloadingOrder.items[0]?.price || 0,
        quantity: downloadingOrder.items[0]?.quantity || 0,
        thumbnail: downloadingOrder.items[0]?.productThumbnail,
      },
      orderItems: downloadingOrder.items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.productThumbnail,
      })),
      totalAmount: downloadingOrder.totalAmount,
      createdAt: downloadingOrder.createdAt,
      orderStatus: downloadingOrder.orderStatus,
      paymentStatus: downloadingOrder.paymentStatus,
      razorpayOrderId: downloadingOrder.razorpayOrderId,
      address: downloadingOrder.address,
    };
  }, [downloadingOrder]);

  const activeOrders = useMemo(() => {
    return liveOrders || [];
  }, [liveOrders]);

  // Compute analytics from activeOrders
  const stats = useMemo(() => {
    const total = activeOrders.length;
    const paidOrders = activeOrders.filter((o) => o.paymentStatus === "paid");
    const revenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pending = activeOrders.filter(
      (o) => o.orderStatus === "placed",
    ).length;
    const completed = activeOrders.filter(
      (o) => o.orderStatus === "delivered",
    ).length;

    return {
      total,
      revenue,
      pending,
      completed,
    };
  }, [activeOrders]);

  const debouncedSearch = useDebounce(searchTerm, 300);

  if (liveOrders === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 animate-in fade-in duration-300">
        <HugeiconsIcon
          icon={Loading03Icon}
          className="w-10 h-10 animate-spin text-primary"
        />
        <p className="text-neutral-500 text-sm">Loading orders list...</p>
      </div>
    );
  }

  // Filter orders
  const term = debouncedSearch.toLowerCase().trim();
  let filteredOrders = activeOrders.filter((order) => {
    if (!term) {
      return statusFilter === "all" || order.orderStatus === statusFilter;
    }
    const matchesSearch =
      order.user?.name?.toLowerCase().includes(term) ||
      order.user?.email?.toLowerCase().includes(term) ||
      order.razorpayOrderId?.toLowerCase().includes(term) ||
      order._id.toLowerCase().includes(term) ||
      order.items.some((item: any) => item.name?.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (term) {
    filteredOrders = [...filteredOrders].sort((a, b) => {
      const getScore = (order: typeof a) => {
        let score = 0;
        const nameLower = order.user?.name?.toLowerCase() || "";
        const emailLower = order.user?.email?.toLowerCase() || "";
        const rzpOrderIdLower = order.razorpayOrderId?.toLowerCase() || "";
        const orderIdLower = order._id.toLowerCase();

        // 1. Exact match on Order ID
        if (orderIdLower === term) score += 100;
        // 2. Exact match on Razorpay Order ID
        else if (rzpOrderIdLower === term) score += 90;
        // 3. Exact match on User Name
        else if (nameLower === term) score += 80;
        // 4. Exact match on User Email
        else if (emailLower === term) score += 70;
        // 5. Order ID starts with/contains term
        else if (orderIdLower.startsWith(term)) score += 60;
        else if (orderIdLower.includes(term)) score += 50;
        // 6. Razorpay Order ID starts with/contains term
        else if (rzpOrderIdLower.startsWith(term)) score += 45;
        else if (rzpOrderIdLower.includes(term)) score += 40;
        // 7. User Name starts with/contains term
        else if (nameLower.startsWith(term)) score += 35;
        else if (nameLower.includes(term)) score += 30;
        // 8. User Email starts with/contains term
        else if (emailLower.startsWith(term)) score += 25;
        else if (emailLower.includes(term)) score += 20;

        // 9. Match item names
        if (
          order.items.some((item: any) => item.name?.toLowerCase() === term)
        ) {
          score += 15;
        } else if (
          order.items.some((item: any) =>
            item.name?.toLowerCase().startsWith(term),
          )
        ) {
          score += 10;
        } else if (
          order.items.some((item: any) =>
            item.name?.toLowerCase().includes(term),
          )
        ) {
          score += 5;
        }

        return score;
      };

      return getScore(b) - getScore(a);
    });
  }

  const handleStatusChange = async (orderId: any, newStatus: any) => {
    try {
      setIsUpdating(orderId);
      await updateStatus({ orderId, status: newStatus });
      toast.success("Order status updated successfully.");
      // Update selected order sheet state if open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update order status.");
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "placed":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#ad8de9]">
            Placed
          </span>
        );
      case "shipped":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600">
            Shipped
          </span>
        );
      case "out_for_delivery":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">
            Out for Delivery
          </span>
        );
      case "delivered":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider text-red-600">
            Failed
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 px-1 sm:px-4 pb-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-start gap-2">
          <ShoppingBag className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
              Orders
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Track, update, and manage all customer purchases and fulfillment
              status.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-2 animate-in fade-in duration-300">
        {/* Revenue Card */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={RupeeIcon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              ₹{stats.revenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Total Orders
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {stats.total}
            </p>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={Clock01Icon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Pending Fulfillment
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {stats.pending}
            </p>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Delivered Orders
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {stats.completed}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs + Filters in one compact row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b border-neutral-200/60 dark:border-neutral-800">
        {/* Tab Switcher */}
        <div className="flex items-center gap-0.5">
          {(["list", "table"] as const).map((v) => {
            const Icon = v === "list" ? ListViewIcon : TableIcon;
            const label = v.charAt(0).toUpperCase() + v.slice(1);
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 -mb-[1px] cursor-pointer ${
                  view === v
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <HugeiconsIcon icon={Icon} size={13} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Inline Filters */}
        <div className="flex items-center gap-1.5 pb-1.5">
          {/* Search Input */}
          <div className="relative flex-1 flex items-center">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 w-3 h-3 text-neutral-455"
            />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-neutral-50/50 border-neutral-200/70 h-7 text-xs w-full rounded-lg focus-visible:ring-1 focus-visible:ring-[#ad8de9] focus-visible:border-[#ad8de9] placeholder:text-neutral-400"
            />
          </div>

          {/* Status Dropdown */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-fit h-7 text-xs bg-white border-neutral-200 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Grid / Table */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
          <HugeiconsIcon
            icon={ShoppingBag01Icon}
            className="w-12 h-12 text-neutral-300 mb-4"
          />
          <h3 className="text-sm font-medium text-neutral-500">
            No orders found
          </h3>
          <p className="text-xs text-neutral-450 mt-0.5 mb-4">
            We couldn&apos;t find any orders matching your filters.
          </p>
        </div>
      ) : (
        <>
          {view === "table" && (
            <OrderTable
              orders={filteredOrders}
              onStatusChange={handleStatusChange}
              onOpenDetails={setSelectedOrder}
              isUpdating={isUpdating}
              getPaymentBadge={getPaymentBadge}
              getStatusBadge={getStatusBadge}
              onDownloadInvoice={handleDownloadInvoice}
              isDownloadingId={isDownloadingId}
            />
          )}

          {view === "list" && (
            <div className="mt-4">
              <OrderListGrouped
                orders={filteredOrders}
                onStatusChange={handleStatusChange}
                onOpenDetails={setSelectedOrder}
                isUpdating={isUpdating}
                getPaymentBadge={getPaymentBadge}
                getStatusBadge={getStatusBadge}
                onDownloadInvoice={handleDownloadInvoice}
                isDownloadingId={isDownloadingId}
              />
            </div>
          )}
        </>
      )}

      {/* Order Details Sheet drawer */}
      <Sheet
        open={selectedOrder !== null}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <SheetContent
          className="sm:max-w-xl overflow-y-auto"
          showCloseButton={false}
        >
          {/* Custom Close Button in top right */}
          <div className="absolute top-4 right-4 z-50">
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-neutral-455 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </Button>
            </SheetClose>
          </div>

          {selectedOrder && (
            <>
              <SheetHeader className="space-y-4 px-4 pt-8">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedOrder.orderStatus)}
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-full font-medium">
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      size={11}
                      className="text-neutral-455"
                    />
                    <span>
                      Placed{" "}
                      {new Date(selectedOrder.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <SheetTitle className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
                      Order Details
                    </SheetTitle>
                    <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-105 dark:bg-neutral-800 px-2.5 py-1 rounded-full uppercase shrink-0">
                      #{selectedOrder._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <SheetDescription className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal block pt-1 px-0.5">
                    View customer shipping address, purchased items, and manage
                    fulfillment.
                  </SheetDescription>
                </div>
              </SheetHeader>

              <Separator className="my-4" />

              <div className="space-y-5 px-4 pb-24">
                {/* 1. Fulfillment Status Update */}
                <div className="space-y-3 bg-neutral-50/30 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">
                    Fulfillment Status
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      Update status:
                    </span>
                    <Select
                      value={selectedOrder.orderStatus}
                      onValueChange={(val) =>
                        handleStatusChange(selectedOrder._id, val)
                      }
                    >
                      <SelectTrigger className="h-9 w-[140px] text-xs rounded-xl bg-white dark:bg-neutral-900 border-neutral-200">
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
                </div>

                {/* 2. Payment details card */}
                <div className="space-y-3 bg-neutral-50/30 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">
                    Payment Information
                  </h4>
                  <div className="border border-neutral-200/60 dark:border-neutral-800/60 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/50">
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800/60">
                          {" "}
                          <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 w-[30%] border-r border-neutral-100 dark:border-neutral-800/60 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                            Method
                          </td>
                          <td className="p-3 text-neutral-700 dark:text-neutral-200 font-semibold flex items-center gap-1.5">
                            <HugeiconsIcon
                              icon={CreditCardIcon}
                              className="w-3.5 h-3.5 text-neutral-400"
                            />
                            Razorpay API
                          </td>
                        </tr>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800/60">
                          <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 border-r border-neutral-100 dark:border-neutral-800/60 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                            Status
                          </td>
                          <td className="p-3">
                            {getPaymentBadge(selectedOrder.paymentStatus)}
                          </td>
                        </tr>
                        {selectedOrder.razorpayOrderId && (
                          <tr className="border-b border-neutral-100 dark:border-neutral-800/60">
                            <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 border-r border-neutral-100 dark:border-neutral-800/60 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                              Order ID
                            </td>
                            <td className="p-3 font-mono text-neutral-600 dark:text-neutral-300">
                              {selectedOrder.razorpayOrderId}
                            </td>
                          </tr>
                        )}
                        {selectedOrder.razorpayPaymentId && (
                          <tr className="border-b border-neutral-100 dark:border-neutral-800/60">
                            <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 border-r border-neutral-100 dark:border-neutral-800/60 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                              Payment ID
                            </td>
                            <td className="p-3 font-mono text-neutral-600 dark:text-neutral-300">
                              {selectedOrder.razorpayPaymentId}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Customer info */}
                <div className="space-y-3 bg-neutral-50/30 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-455">
                    Customer Information
                  </h4>
                  <div className="border border-neutral-200/60 dark:border-neutral-800/60 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/50">
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800/60">
                          <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 w-[30%] border-r border-neutral-100 dark:border-neutral-800/60 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                            Name
                          </td>
                          <td className="p-3 text-neutral-700 dark:text-neutral-200 font-semibold">
                            {selectedOrder.user?.name || "Guest Customer"}
                          </td>
                        </tr>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800/60">
                          <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 border-r border-neutral-100 dark:border-neutral-800/60 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                            Email
                          </td>
                          <td className="p-3 text-neutral-700 dark:text-neutral-200 font-medium">
                            {selectedOrder.user?.email || "—"}
                          </td>
                        </tr>
                        {selectedOrder.address?.phone && (
                          <tr>
                            <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 border-r border-neutral-100 dark:border-neutral-800/60 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                              Phone
                            </td>
                            <td className="p-3 text-neutral-700 dark:text-neutral-200 font-semibold font-mono">
                              {selectedOrder.address.phone}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Shipping Address */}
                <div className="space-y-3 bg-neutral-50/30 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-455">
                    Shipping Address
                  </h4>
                  {selectedOrder.address ? (
                    <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/60 rounded-xl p-4 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed flex items-start gap-2.5">
                      <HugeiconsIcon
                        icon={Location01Icon}
                        className="w-4 h-4 text-primary shrink-0 mt-0.5"
                      />
                      <div>
                        <div className="font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                          {selectedOrder.address.fullName}
                        </div>
                        <div>{selectedOrder.address.address}</div>
                        <div>
                          {selectedOrder.address.locality &&
                            `${selectedOrder.address.locality}, `}
                          {selectedOrder.address.city}
                        </div>
                        <div>
                          {selectedOrder.address.state} —{" "}
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {selectedOrder.address.pincode}
                          </span>
                        </div>
                        {selectedOrder.address.landmark && (
                          <div className="text-neutral-400 dark:text-neutral-500 italic mt-1.5">
                            Landmark: {selectedOrder.address.landmark}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-50/30 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900 rounded-xl p-4 text-xs text-rose-500 text-center italic">
                      Address information missing.
                    </div>
                  )}
                </div>

                {/* 5. Order Summary Items */}
                <div className="space-y-3 bg-neutral-50/30 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">
                    Items & Summary
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, idx: number) => {
                      const CATS: Record<string, string> = {
                        "customized-gifts": "Customized Gifts",
                        "corporate-gifts": "Corporate Gifts",
                        hampers: "Hampers",
                        "frames-bouquet": "Frames & Bouquet",
                        "shop-by-occasion": "Shop by Occasion",
                        "new-arrivals": "New Arrivals",
                      };
                      return (
                        <div
                          key={idx}
                          className="border border-neutral-200/60 dark:border-neutral-800/60 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/50"
                        >
                          <div className="p-3.5 flex gap-3">
                            {/* Thumbnail */}
                            {item.productThumbnail && (
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                                <ItemThumbnail
                                  storageId={item.productThumbnail}
                                />
                              </div>
                            )}
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                                    {item.name}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    {item.category && (
                                      <span className="text-[10px] font-medium text-primary">
                                        {CATS[item.category] || item.category}
                                      </span>
                                    )}
                                    {item.category && item.subCategory && (
                                      <span className="text-[10px] text-neutral-300 dark:text-neutral-600">
                                        ›
                                      </span>
                                    )}
                                    {item.subCategory && (
                                      <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                        {item.subCategory}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 font-mono shrink-0">
                                  ₹
                                  {(item.price * item.quantity).toLocaleString(
                                    "en-IN",
                                  )}
                                </p>
                              </div>

                              {/* Tags */}
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.tags
                                    .slice(0, 4)
                                    .map((tag: string, tIdx: number) => (
                                      <span
                                        key={tIdx}
                                        className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  {item.tags.length > 4 && (
                                    <span className="text-[9px] font-medium text-neutral-400">
                                      +{item.tags.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Price breakdown */}
                              <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-500 dark:text-neutral-400">
                                <span>
                                  Unit:{" "}
                                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                    ₹{item.price.toLocaleString("en-IN")}
                                  </span>
                                </span>
                                <span>×</span>
                                <span>
                                  Qty:{" "}
                                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                    {item.quantity}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total */}
                  <div className="border border-neutral-200/60 dark:border-neutral-800/60 rounded-xl overflow-hidden">
                    <div className="p-3.5 bg-neutral-50/50 dark:bg-neutral-900/30 flex justify-between items-center text-xs font-bold">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Total Amount
                      </span>
                      <span className="text-sm text-primary font-mono font-extrabold">
                        ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Invoice Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(selectedOrder)}
                      disabled={isDownloadingId === selectedOrder._id}
                      className="rounded-full text-xs font-bold bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 cursor-pointer font-sans"
                    >
                      {isDownloadingId === selectedOrder._id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download size={14} className="mr-1.5" />
                          Download Invoice
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Off-screen Printable Invoice Container */}
      {typeof window !== "undefined" && displayItemForInvoice && (
        <InvoiceTemplatePortal displayItem={displayItemForInvoice} />
      )}
    </div>
  );
}

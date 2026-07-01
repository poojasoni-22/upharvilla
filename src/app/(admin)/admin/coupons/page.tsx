"use client";

import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  Calendar,
  Edit2,
  Plus,
  Power,
  Search,
  Tag,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type DiscountType = "percentage" | "flat" | "free_shipping";
type ApplicableTo = "all" | "category" | "product";

interface CouponForm {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: string;
  maxDiscount: string;
  applicableTo: ApplicableTo;
  applicableCategory: string;
  totalUsageLimit: string;
  perUserLimit: number;
  startsAt: string;
  expiresAt: string;
}

const EMPTY_FORM: CouponForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderAmount: "",
  maxDiscount: "",
  applicableTo: "all",
  applicableCategory: "",
  totalUsageLimit: "",
  perUserLimit: 1,
  startsAt: new Date().toISOString().slice(0, 16),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16),
};

const CATEGORIES = [
  { value: "customized-gifts", label: "Customized Gifts" },
  { value: "corporate-gifts", label: "Corporate Gifts" },
  { value: "hampers", label: "Hampers" },
  { value: "frames-bouquet", label: "Frames & Bouquet" },
  { value: "shop-by-occasion", label: "Shop by Occasion" },
  { value: "new-arrivals", label: "New Arrivals" },
];

export default function CouponsPage() {
  const coupons = useQuery(api.coupons.list);
  const createCoupon = useMutation(api.coupons.create);
  const updateCoupon = useMutation(api.coupons.update);
  const toggleActive = useMutation(api.coupons.toggleActive);
  const removeCoupon = useMutation(api.coupons.remove);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<Id<"coupons"> | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"coupons"> | null>(
    null,
  );

  const now = Date.now();
  const activeCoupons =
    coupons?.filter((c) => c.isActive && c.startsAt <= now && c.expiresAt > now)
      .length ?? 0;
  const expiredCoupons = coupons?.filter((c) => c.expiresAt <= now).length ?? 0;
  const totalRedemptions =
    coupons?.reduce((sum, c) => sum + c.currentUsageCount, 0) ?? 0;

  const debouncedQuery = useDebounce(searchQuery, 300);

  const filteredCoupons = useMemo(() => {
    if (!coupons) return undefined;
    if (!debouncedQuery.trim()) return coupons;
    const q = debouncedQuery.toLowerCase();
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [coupons, debouncedQuery]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (coupon: any) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount?.toString() ?? "",
      maxDiscount: coupon.maxDiscount?.toString() ?? "",
      applicableTo: coupon.applicableTo,
      applicableCategory: coupon.applicableCategory ?? "",
      totalUsageLimit: coupon.totalUsageLimit?.toString() ?? "",
      perUserLimit: coupon.perUserLimit,
      startsAt: new Date(coupon.startsAt).toISOString().slice(0, 16),
      expiresAt: new Date(coupon.expiresAt).toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      toast.error("Coupon code is required.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required.");
      return;
    }
    if (form.discountType !== "free_shipping" && form.discountValue <= 0) {
      toast.error("Discount value must be greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        code: form.code.toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        discountValue:
          form.discountType === "free_shipping" ? 0 : form.discountValue,
        minOrderAmount: form.minOrderAmount
          ? Number(form.minOrderAmount)
          : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        applicableTo: form.applicableTo,
        applicableCategory:
          form.applicableTo === "category"
            ? form.applicableCategory
            : undefined,
        totalUsageLimit: form.totalUsageLimit
          ? Number(form.totalUsageLimit)
          : undefined,
        perUserLimit: form.perUserLimit,
        startsAt: new Date(form.startsAt).getTime(),
        expiresAt: new Date(form.expiresAt).getTime(),
      };

      if (editingId) {
        await updateCoupon({ id: editingId, ...data });
        toast.success("Coupon updated successfully!");
      } else {
        await createCoupon(data);
        toast.success("Coupon created successfully!");
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: Id<"coupons">) => {
    try {
      const newState = await toggleActive({ id });
      toast.success(newState ? "Coupon activated!" : "Coupon deactivated.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to toggle coupon.");
    }
  };

  const handleDelete = async (id: Id<"coupons">) => {
    try {
      await removeCoupon({ id });
      toast.success("Coupon deleted.");
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete coupon.");
    }
  };

  const getStatusBadge = (coupon: any) => {
    if (!coupon.isActive) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-neutral-100 text-neutral-500 uppercase">
          Inactive
        </span>
      );
    }
    if (coupon.expiresAt <= now) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-600 uppercase">
          Expired
        </span>
      );
    }
    if (coupon.startsAt > now) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-600 uppercase">
          Scheduled
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-600 uppercase">
        Active
      </span>
    );
  };

  const getDiscountLabel = (coupon: any) => {
    if (coupon.discountType === "percentage")
      return `${coupon.discountValue}% OFF`;
    if (coupon.discountType === "flat") return `₹${coupon.discountValue} OFF`;
    return "Free Shipping";
  };

  if (coupons === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-1 sm:px-4 pb-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div className="flex items-start gap-2">
          <Ticket className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
              Coupons & Offers
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Create and manage discount coupons for your store.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-xs hover:opacity-90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Coupon
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-300">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
            Total Coupons
          </p>
          <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
            {coupons.length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
            Active
          </p>
          <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
            {activeCoupons}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
            Expired
          </p>
          <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
            {expiredCoupons}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
            Redemptions
          </p>
          <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
            {totalRedemptions}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 w-3 h-3 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by code or description..."
          className="w-full pl-8 bg-neutral-50/50 border border-neutral-200/70 h-8 text-xs rounded-lg outline-none focus:border-[#ad8de9] focus:ring-1 focus:ring-[#ad8de9]/20 transition-all placeholder:text-neutral-400"
        />
      </div>

      {/* Table */}
      {filteredCoupons && filteredCoupons.length > 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-600 text-xs uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-600 text-xs uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-600 text-xs uppercase tracking-wider hidden md:table-cell">
                    Min Order
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-600 text-xs uppercase tracking-wider hidden lg:table-cell">
                    Usage
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-600 text-xs uppercase tracking-wider hidden lg:table-cell">
                    Validity
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-600 text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-neutral-600 text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-neutral-800 font-mono">
                          {coupon.code}
                        </span>
                        <span className="text-[11px] text-neutral-500 line-clamp-1">
                          {coupon.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                        <Tag className="w-3 h-3" />
                        {getDiscountLabel(coupon)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 hidden md:table-cell">
                      {coupon.minOrderAmount
                        ? `₹${coupon.minOrderAmount}`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <span className="text-neutral-700 font-medium">
                        {coupon.currentUsageCount}
                      </span>
                      <span className="text-neutral-400">
                        /{coupon.totalUsageLimit ?? "∞"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(coupon.expiresAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(coupon)}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggle(coupon._id)}
                          className={`cursor-pointer p-2 rounded-lg transition-colors ${
                            coupon.isActive
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-neutral-400 hover:bg-neutral-100"
                          }`}
                          title={coupon.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(coupon)}
                          className="cursor-pointer p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(coupon._id)}
                          className="cursor-pointer p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-neutral-100 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800">No Coupons Yet</h3>
          <p className="text-sm text-neutral-500 mt-1 mb-4">
            Create your first coupon to start offering discounts.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-800">Delete Coupon?</h3>
                <p className="text-xs text-neutral-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="cursor-pointer flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="cursor-pointer flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-800">
                {editingId ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="cursor-pointer p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Code & Description */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. WELCOME10"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="e.g. 10% off on your first order"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    Discount Type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountType: e.target.value as DiscountType,
                      })
                    }
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    {form.discountType === "percentage"
                      ? "Discount %"
                      : form.discountType === "flat"
                        ? "Amount (₹)"
                        : "Value"}
                  </label>
                  <input
                    type="number"
                    value={
                      form.discountType === "free_shipping"
                        ? 0
                        : form.discountValue
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountValue: Number(e.target.value),
                      })
                    }
                    disabled={form.discountType === "free_shipping"}
                    min={0}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:bg-neutral-50 disabled:text-neutral-400"
                  />
                </div>
              </div>

              {/* Constraints */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      setForm({ ...form, minOrderAmount: e.target.value })
                    }
                    placeholder="No minimum"
                    min={0}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) =>
                      setForm({ ...form, maxDiscount: e.target.value })
                    }
                    placeholder="No cap"
                    min={0}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Applicability */}
              <div>
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                  Applies To
                </label>
                <select
                  value={form.applicableTo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      applicableTo: e.target.value as ApplicableTo,
                    })
                  }
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                >
                  <option value="all">All Products</option>
                  <option value="category">Specific Category</option>
                </select>
              </div>
              {form.applicableTo === "category" && (
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    Category
                  </label>
                  <select
                    value={form.applicableCategory}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        applicableCategory: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    value={form.totalUsageLimit}
                    onChange={(e) =>
                      setForm({ ...form, totalUsageLimit: e.target.value })
                    }
                    placeholder="Unlimited"
                    min={1}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    value={form.perUserLimit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        perUserLimit: Number(e.target.value),
                      })
                    }
                    min={1}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    Starts At
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) =>
                      setForm({ ...form, startsAt: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) =>
                      setForm({ ...form, expiresAt: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="cursor-pointer flex-1 py-3 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="cursor-pointer flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingId
                    ? "Update Coupon"
                    : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

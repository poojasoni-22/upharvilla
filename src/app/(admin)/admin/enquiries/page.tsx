"use client";

import {
  Clock01Icon,
  Mail01Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Mail, MessageSquare, Phone, Search, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const ITEMS_PER_PAGE = 20;

function timeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EnquiryManagementPage() {
  const {
    results: enquiries,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.enquiries.listPaginated,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );
  const deleteEnquiry = useMutation(api.enquiries.deleteEnquiry);

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    if (!enquiries) return [];
    if (!debouncedSearch.trim()) return enquiries;
    const q = debouncedSearch.toLowerCase();
    return enquiries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q) ||
        e.phone?.includes(q),
    );
  }, [enquiries, debouncedSearch]);

  const stats = useMemo(() => {
    if (!enquiries || enquiries.length === 0)
      return { total: 0, today: 0, thisWeek: 0 };
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return {
      total: enquiries.length,
      today: enquiries.filter((e) => e.createdAt >= todayStart).length,
      thisWeek: enquiries.filter((e) => e.createdAt >= weekAgo).length,
    };
  }, [enquiries]);

  const selectedEnquiry = filtered.find((e) => e._id === selectedId);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteEnquiry({ id: id as Id<"enquiries"> });
      toast.success("Enquiry deleted");
      if (selectedId === id) setSelectedId(null);
    } catch {
      toast.error("Failed to delete enquiry");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReply = (email: string, name: string) => {
    const subject = encodeURIComponent("Re: Your enquiry to upharVilla");
    const body = encodeURIComponent(
      `Hi ${name},\n\nThank you for reaching out to upharVilla.\n\n`,
    );
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
      "_blank",
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col lg:h-[calc(100vh-80px)] px-1 sm:px-4 pt-2 gap-4">
        <div className="flex items-start gap-2">
          <MessageSquare className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
              Enquiries
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[72px] bg-neutral-50 rounded-2xl border border-neutral-200 animate-pulse"
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
          <MessageSquare className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
              Enquiries
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Manage customer enquiries and respond to feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-3 gap-4 mt-4 shrink-0 animate-in fade-in duration-300">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={Message01Icon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Total Enquiries
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {stats.total}
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={Clock01Icon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Today
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {stats.today}
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={Mail01Icon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              This Week
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {stats.thisWeek}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center border-b border-neutral-200/60 pb-2.5 mt-4 shrink-0">
        <div className="relative flex items-center pb-1.5 w-full sm:w-auto">
          <Search className="absolute left-2.5 w-3 h-3 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search by name, email, phone, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-neutral-50/50 border-neutral-200/70 h-7 text-xs w-full sm:w-72 rounded-lg focus-visible:ring-1 focus-visible:ring-[#ad8de9] focus-visible:border-[#ad8de9] placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* List + Detail — fills remaining viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-3 min-h-0 flex-1 pb-4">
        {/* Enquiry List */}
        <div className="lg:col-span-3 min-h-0 flex flex-col">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 border border-dashed border-neutral-200 rounded-xl">
              <MessageSquare className="w-12 h-12 text-neutral-200 mb-4" />
              <h3 className="text-sm font-medium text-neutral-500">
                No enquiries found
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {search ? "Try a different search term." : "No enquiries yet."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col min-h-0 flex-1 overflow-y-auto p-1.5 space-y-1.5">
              {filtered.map((enquiry, index) => (
                <button
                  key={enquiry._id}
                  type="button"
                  onClick={() => setSelectedId(enquiry._id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer shrink-0 ${
                    selectedId === enquiry._id
                      ? "border-neutral-300 bg-neutral-50/80 shadow-xs"
                      : "border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-bold text-neutral-300 font-mono shrink-0 w-4 text-right">
                        {index + 1}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase">
                          {enquiry.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-800 truncate">
                          {enquiry.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {enquiry.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap shrink-0">
                      {timeAgo(enquiry.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2 line-clamp-2 leading-relaxed pl-[52px]">
                    {enquiry.message}
                  </p>
                </button>
              ))}

              {status === "CanLoadMore" && !debouncedSearch.trim() && (
                <button
                  type="button"
                  onClick={() => loadMore(ITEMS_PER_PAGE)}
                  className="w-full py-2 rounded-lg border border-neutral-200/70 bg-neutral-50/50 text-[11px] font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2 min-h-0 flex flex-col">
          {selectedEnquiry ? (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-neutral-500 uppercase">
                      {selectedEnquiry.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-800">
                      {selectedEnquiry.name}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {formatDate(selectedEnquiry.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedEnquiry._id)}
                  disabled={deletingId === selectedEnquiry._id}
                  className="p-2 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                  title="Delete enquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="text-xs text-neutral-600 hover:text-primary truncate"
                  >
                    {selectedEnquiry.email}
                  </a>
                </div>
                {selectedEnquiry.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      className="text-xs text-neutral-600 hover:text-primary"
                    >
                      {selectedEnquiry.phone}
                    </a>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Message
                </p>
                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                  <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {selectedEnquiry.message}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleReply(selectedEnquiry.email, selectedEnquiry.name)
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Reply via Email
                </button>
                {selectedEnquiry.phone && (
                  <a
                    href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1ebe5d] transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-8 flex flex-col items-center justify-center text-center flex-1">
              <User className="w-10 h-10 text-neutral-200 mb-3" />
              <p className="text-sm font-medium text-neutral-500">
                Select an enquiry
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Click on any enquiry to view details and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface OrdersSidebarProps {
  selectedStatuses: string[];
  onStatusChange: (status: string) => void;
  selectedTimes: string[];
  onTimeChange: (time: string) => void;
  onClear: () => void;
  hasFilters: boolean;
}

export const OrdersSidebar: React.FC<OrdersSidebarProps> = ({
  selectedStatuses,
  onStatusChange,
  selectedTimes,
  onTimeChange,
  onClear,
  hasFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden transition-all duration-300">
      {/* Sidebar Header (Toggles on mobile) */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-neutral-50/30 cursor-pointer lg:cursor-default lg:hover:bg-transparent"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-neutral-800 tracking-tight">
            Filters
          </h2>
          {hasFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-[10px] font-bold text-primary hover:underline transition-all cursor-pointer lg:block hidden"
            >
              CLEAR ALL
            </button>
          )}
          {/* Chevron shown only on mobile/tablet */}
          <div className="lg:hidden text-neutral-500">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Clear All for mobile layout */}
      {hasFilters && (
        <div className="px-5 pb-3 lg:hidden flex justify-end">
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] font-bold text-primary hover:underline transition-all cursor-pointer"
          >
            CLEAR ALL
          </button>
        </div>
      )}

      {/* Sidebar Content (Collapsible on mobile, grid layout side-by-side) */}
      <div
        className={`p-5 pt-0 border-t border-neutral-100 lg:border-t-0 lg:flex lg:flex-col lg:space-y-6 lg:gap-0 ${
          isOpen ? "grid grid-cols-2 gap-6 pt-4 lg:pt-0" : "hidden lg:flex"
        }`}
      >
        {/* Status Filters */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Order Status
          </h3>
          <div className="space-y-2.5">
            {[
              { value: "on_the_way", label: "On the way" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
              { value: "returned", label: "Returned" },
            ].map((status) => (
              <label
                key={status.value}
                className="flex items-center gap-3 cursor-pointer group text-xs select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status.value)}
                  onChange={() => onStatusChange(status.value)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-neutral-300 accent-primary cursor-pointer"
                />
                <span className="text-neutral-600 group-hover:text-neutral-800 font-medium transition-colors">
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Filters */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Order Time
          </h3>
          <div className="space-y-2.5">
            {[
              { value: "last_30_days", label: "Last 30 days" },
              { value: "2026", label: "2026" },
              { value: "2025", label: "2025" },
              { value: "older", label: "Older" },
            ].map((time) => (
              <label
                key={time.value}
                className="flex items-center gap-3 cursor-pointer group text-xs select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedTimes.includes(time.value)}
                  onChange={() => onTimeChange(time.value)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-neutral-300 accent-primary cursor-pointer"
                />
                <span className="text-neutral-600 group-hover:text-neutral-800 font-medium transition-colors">
                  {time.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersSidebar;

import {
  CheckCircle2,
  HelpCircle,
  History,
  Package,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import Typewriter from "typewriter-effect";

interface OrdersSearchBarProps {
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  allOrderItems: any[];
  onSelectSuggestion: (itemId: string) => void;
}

export const OrdersSearchBar: React.FC<OrdersSearchBarProps> = ({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  allOrderItems,
  onSelectSuggestion,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanQuery = searchInput.trim().toLowerCase();
  const isSearchActive = cleanQuery.length >= 2;

  // Filter matching suggestions
  const suggestions = isSearchActive
    ? allOrderItems
        .filter((item) => {
          const matchesName = item.item.name.toLowerCase().includes(cleanQuery);
          const matchesId = item.orderId.toLowerCase().includes(cleanQuery);
          return matchesName || matchesId;
        })
        .slice(0, 5)
    : allOrderItems.slice(0, 3); // Show first 3 orders when query is empty as "Recent Orders"

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed":
        return <Package className="w-3 h-3 text-[#ad8de9]" />;
      case "shipped":
      case "out_for_delivery":
        return <Truck className="w-3 h-3 text-amber-500" />;
      case "delivered":
        return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case "cancelled":
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <HelpCircle className="w-3 h-3 text-neutral-400" />;
    }
  };

  const handleSuggestionClick = (itemId: string) => {
    setIsFocused(false);
    onSelectSuggestion(itemId);
  };

  return (
    <div ref={containerRef} className="relative w-full z-45">
      <form
        onSubmit={onSearchSubmit}
        className="relative flex items-center overflow-hidden border border-neutral-150 rounded-2xl shadow-sm bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-300"
      >
        {/* Left Search Icon */}
        <div className="absolute left-4 text-neutral-400 pointer-events-none">
          <Search size={16} />
        </div>

        {/* Input Field */}
        <div className="flex-1 relative h-11 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full h-full pl-10 pr-4 py-2.5 text-sm outline-none border-none placeholder:text-transparent bg-transparent font-sans text-neutral-800"
          />

          {/* Typewriter Placeholder */}
          {!searchInput && !isFocused && (
            <div className="absolute left-10 right-10 pointer-events-none text-[11px] sm:text-xs md:text-sm text-neutral-400 font-normal opacity-70 overflow-hidden whitespace-nowrap">
              <Typewriter
                options={{
                  strings: [
                    "Search your orders...",
                    "Search by product name...",
                    "Search by Order ID...",
                    "Track delivery status...",
                    "Verify billing details...",
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 30,
                  wrapperClassName: "opacity-70",
                }}
              />
            </div>
          )}
        </div>

        {/* Clear Button */}
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              onSearchInputChange("");
              inputRef.current?.focus();
            }}
            className="p-1.5 mr-2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer rounded-full hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-white px-6 font-bold text-sm h-11 flex items-center gap-2 transition-all rounded-r-2xl shrink-0 cursor-pointer"
        >
          <span>Search Orders</span>
        </button>
      </form>

      {/* Live Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-150 shadow-2xl rounded-2xl p-4 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-left flex items-center gap-1.5 border-b border-neutral-100 pb-1.5">
              {isSearchActive ? (
                <span>Matching Products</span>
              ) : (
                <span className="flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-neutral-400" />
                  Recent Purchased Items
                </span>
              )}
            </h3>

            <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto pr-1">
              {suggestions.map((item) => (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => handleSuggestionClick(item.itemId)}
                  className="w-full text-left py-2.5 flex items-center gap-3 hover:bg-neutral-50 px-2 rounded-xl transition-all cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="w-9 h-9 rounded-lg border border-neutral-150 overflow-hidden shrink-0 bg-neutral-50 flex items-center justify-center">
                    <img
                      src={
                        item.item.thumbnail ||
                        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=150&auto=format&fit=crop&q=60"
                      }
                      alt={item.item.name}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-neutral-800 truncate group-hover:text-primary transition-colors">
                      {item.item.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-450 mt-0.5">
                      <span className="font-mono uppercase">
                        #{item.orderId.slice(-8).toUpperCase()}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1 font-medium capitalize">
                        {getStatusIcon(item.orderStatus)}
                        <span>{item.orderStatus.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-neutral-900 font-mono">
                      ₹{item.item.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[9px] text-neutral-400 mt-0.5">
                      Qty: {item.item.quantity}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersSearchBar;

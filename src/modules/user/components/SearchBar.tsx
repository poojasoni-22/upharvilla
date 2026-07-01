"use client";

import { useMutation, useQuery } from "convex/react";
import { History, Loader2, Search, SearchIcon, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import Typewriter from "typewriter-effect";
import { authClient } from "@/lib/auth-client";
import { api } from "../../../../convex/_generated/api";

export const SearchBar = ({ onClose }: { onClose?: () => void }) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Auto focus input on mount if onClose is provided (mobile expanded)
  useEffect(() => {
    if (onClose && inputRef.current) {
      // Small timeout to ensure keyboard triggers properly on all mobile devices
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Convex query for live search results (debounced)
  const isSearchActive = debouncedQuery.length >= 2;
  const searchResults = useQuery(
    api.products.search,
    isSearchActive ? { searchTerm: debouncedQuery } : "skip",
  );
  const isSearching = isSearchActive && searchResults === undefined;

  // Recent searches list and mutations
  const recentSearches =
    useQuery(api.recentSearches.list, session ? undefined : "skip") ?? [];
  const recordSearch = useMutation(api.recentSearches.recordSearch);
  const removeSearch = useMutation(api.recentSearches.removeSearch);
  const clearAllSearches = useMutation(api.recentSearches.clearAll);

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

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (cleanQuery) {
      setIsFocused(false);
      if (session) {
        await recordSearch({ query: cleanQuery });
      }
      router.push(`/products?search=${encodeURIComponent(cleanQuery)}`);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const cleanQuery = query.trim();
      if (cleanQuery) {
        setIsFocused(false);
        if (session) {
          await recordSearch({ query: cleanQuery });
        }
        router.push(`/products?search=${encodeURIComponent(cleanQuery)}`);
      }
    }
  };

  const handleRecentSearchClick = async (searchTerm: string) => {
    setQuery(searchTerm);
    setIsFocused(false);
    if (session) {
      await recordSearch({ query: searchTerm });
    }
    router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleProductSuggestionClick = async (
    productId: string,
    productName: string,
  ) => {
    setIsFocused(false);
    // Also save this term in recent search history if logged in
    if (session) {
      await recordSearch({ query: productName });
    }
    router.push(`/product/${productId}`);
  };

  const handleRemoveRecentSearch = async (
    e: React.MouseEvent,
    searchId: any,
  ) => {
    e.stopPropagation(); // Prevent search trigger on click
    await removeSearch({ id: searchId });
  };

  const handleClearAllSearches = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await clearAllSearches({});
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full md:max-w-2xl px-1 md:px-4 relative z-50 flex items-center gap-2"
    >
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex-1 flex items-center h-10 md:h-8 lg:h-10 xl:h-11 bg-neutral-50 border border-neutral-200 rounded-full md:rounded-md overflow-hidden focus-within:border-primary focus-within:bg-white transition-all"
      >
        <div className="pl-3 md:pl-3 lg:pl-4 pr-1 md:pr-1 lg:pr-2 text-gray-500 shrink-0">
          <Search className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
        </div>
        <div className="flex-1 relative h-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent border-none outline-none text-xs md:text-xs lg:text-sm xl:text-base text-neutral-800 pr-4 pl-0 py-0 focus:ring-0 focus:outline-none"
          />
          {!query && !isFocused && (
            <div className="absolute left-0 right-10 pointer-events-none text-[11px] sm:text-xs md:text-xs lg:text-sm xl:text-base text-gray-400 font-normal opacity-70 overflow-hidden whitespace-nowrap">
              <Typewriter
                options={{
                  strings: [
                    "Search Personalized Gifts...",
                    "Search Corporate Hampers...",
                    "Search Customized Jewelry...",
                    "Search Birthday Surprises...",
                    "Search Anniversary Gifts...",
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
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="p-1.5 mr-2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!onClose && (
          <div className="pr-1">
            <button
              type="submit"
              className="h-7 md:h-7 lg:h-8 xl:h-9 px-2 lg:px-4 xl:px-5 bg-[#ad8de9] text-white text-xs lg:text-sm xl:text-base font-semibold rounded hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <SearchIcon className="inline w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline ml-1">Search</span>
            </button>
          </div>
        )}
      </form>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-primary hover:text-primary/80 active:scale-95 transition-all px-2 py-1 whitespace-nowrap shrink-0"
        >
          Cancel
        </button>
      )}

      {/* Suggestion Dropdown Panel */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 md:left-4 md:right-4 mt-2 bg-white border border-neutral-200 shadow-2xl rounded-2xl p-4 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Case 1: Searching State */}
          {isSearching && (
            <div className="flex items-center justify-center py-6 text-sm text-neutral-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Searching products...
            </div>
          )}

          {/* Case 2: Suggestions Found */}
          {!isSearching && isSearchActive && searchResults && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-left">
                Suggested Products
              </h3>
              {searchResults.length === 0 ? (
                <div className="text-sm text-neutral-500 py-3 text-left">
                  No products found for &quot;{debouncedQuery}&quot;
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto pr-1">
                  {searchResults.map((product) => (
                    <button
                      key={product._id}
                      onClick={() =>
                        handleProductSuggestionClick(product._id, product.name)
                      }
                      className="w-full text-left py-2.5 flex items-center gap-3 hover:bg-neutral-50 px-2 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-150 shrink-0">
                        <Image
                          src={
                            product.thumbnail ||
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
                          }
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-800 truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-neutral-450 capitalize">
                          {product.category.replace("-", " ")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-neutral-900 font-mono">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                        {product.discount && (
                          <span className="text-[10px] font-bold text-rose-500">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Case 3: Recent Searches (Input empty or short) */}
          {!isSearching && !isSearchActive && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Recent Searches
                </h3>
                {session && recentSearches.length > 0 && (
                  <button
                    onClick={handleClearAllSearches}
                    className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {!session ? (
                <div className="text-xs text-neutral-500 py-2 text-left italic">
                  Sign in to save your search history.
                </div>
              ) : recentSearches.length === 0 ? (
                <div className="text-xs text-neutral-550 py-2 text-left italic">
                  No recent searches.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {recentSearches.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => handleRecentSearchClick(s.query)}
                      className="flex items-center justify-between text-sm text-neutral-700 hover:bg-neutral-50 px-2 py-2 rounded-xl transition-all cursor-pointer group"
                    >
                      <span className="group-hover:text-primary transition-colors font-medium">
                        {s.query}
                      </span>
                      <button
                        onClick={(e) => handleRemoveRecentSearch(e, s._id)}
                        className="p-1 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

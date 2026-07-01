"use client";

import { ChevronDown, Loader2, Locate, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface LocationState {
  city: string;
  pincode?: string;
  isManual?: boolean;
}

export const LocationSelector = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualPincode, setManualPincode] = useState("");
  const [_isMounted, setIsMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const autoDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setError("Not supported");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          if (!res.ok) throw new Error("Failed to reverse geocode");

          const data = await res.json();

          // Try to extract city, fallback to principalSubdivision or locality
          const city =
            data.city ||
            data.locality ||
            data.principalSubdivision ||
            "Unknown Location";
          const pincode = data.postcode || "";

          const newLocation: LocationState = { city, pincode, isManual: false };
          setLocation(newLocation);
          localStorage.setItem("user_location", JSON.stringify(newLocation));
          toast.success(`Location detected: ${city}`);
          setIsOpen(false);
        } catch (err: any) {
          console.error(err);
          setError("Failed to resolve location details.");
          toast.error("Could not fetch location name. Try entering pincode.");
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setIsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied.");
          toast.error(
            "Location permission denied. Please enter pincode manually.",
          );
        } else {
          setError("Failed to retrieve location.");
          toast.error(
            "Could not retrieve location. Please enter pincode manually.",
          );
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  };

  // Load saved location on mount
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("user_location");
    if (stored) {
      try {
        setLocation(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored location", e);
      }
    } else {
      // Auto-detect on first visit
      autoDetectLocation();
    }
  }, [
    // Auto-detect on first visit
    autoDetectLocation,
  ]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualPincode.trim();
    if (!/^\d{6}$/.test(cleaned)) {
      toast.error("Please enter a valid 6-digit Indian pincode.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${cleaned}`,
      );
      if (!res.ok) throw new Error("Failed to fetch pincode details");

      const data = await res.json();
      if (
        data?.[0] &&
        data[0].Status === "Success" &&
        data[0].PostOffice?.[0]
      ) {
        const office = data[0].PostOffice[0];
        const city = office.District;
        const state = office.State;
        const displayLocation = `${city}, ${state}`;

        const newLocation: LocationState = {
          city: displayLocation,
          pincode: cleaned,
          isManual: true,
        };
        setLocation(newLocation);
        localStorage.setItem("user_location", JSON.stringify(newLocation));
        toast.success(`Location set to ${displayLocation}`);
        setManualPincode("");
        setIsOpen(false);
      } else {
        toast.error("Invalid pincode or details not found.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error verifying pincode. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem("user_location");
    toast.success("Location cleared.");
  };

  // Truncate city name for UI display
  const getDisplayCity = () => {
    if (!location) return "Location missing";
    const parts = location.city.split(",");
    const cityName = parts[0].trim();
    return cityName.length > 18 ? `${cityName.slice(0, 15)}...` : cityName;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-start mt-1 gap-3 px-2 py-1.5 cursor-pointer hover:bg-neutral-50 rounded-xl transition-all duration-200 outline-none text-left animate-in fade-in duration-300"
      >
        <div className="relative h-6 w-8 overflow-hidden rounded-sm border border-neutral-100 shadow-sm shrink-0">
          <svg
            viewBox="0 0 900 600"
            className="absolute inset-0 w-full h-full"
            aria-label="India"
            role="img"
          >
            {/* Saffron */}
            <rect width="900" height="200" fill="#FF9933" />
            {/* White */}
            <rect y="200" width="900" height="200" fill="#FFFFFF" />
            {/* Green */}
            <rect y="400" width="900" height="200" fill="#138808" />
            {/* Ashoka Chakra */}
            <circle
              cx="450"
              cy="300"
              r="60"
              fill="none"
              stroke="#000080"
              strokeWidth="6"
            />
            {/* 24 spokes */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15 * Math.PI) / 180;
              const x2 = 450 + 55 * Math.sin(angle);
              const y2 = 300 - 55 * Math.cos(angle);
              return (
                <line
                  key={i}
                  x1="450"
                  y1="300"
                  x2={x2}
                  y2={y2}
                  stroke="#000080"
                  strokeWidth="3"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-sm lg:text-base font-bold whitespace-nowrap text-gray-800">
            {location ? `Deliver to ${getDisplayCity()}` : "Where to deliver?"}
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`text-[11px] lg:text-xs whitespace-nowrap font-semibold tracking-wide ${
                location ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {location
                ? location.pincode
                  ? `Pin: ${location.pincode}`
                  : "India"
                : "Location missing"}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              } ${location ? "text-emerald-600" : "text-rose-500"}`}
            />
          </div>
        </div>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-[calc(100%+8px)] left-0 w-80 bg-white border border-neutral-100 rounded-2xl shadow-xl p-5 z-[999] flex flex-col gap-4 animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              Delivery Location
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {location && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                  Current Location
                </span>
                <span className="text-xs font-bold text-neutral-700 capitalize">
                  {location.city}
                </span>
                {location.pincode && (
                  <span className="text-xs text-neutral-500">
                    Pincode: {location.pincode}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={clearLocation}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={autoDetectLocation}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-xs shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Locate className="w-3.5 h-3.5" />
                Auto-Detect Location
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100" />
            </div>
            <span className="relative bg-white px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Or
            </span>
          </div>

          <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Enter Indian Pincode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 400001"
                value={manualPincode}
                onChange={(e) =>
                  setManualPincode(
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                maxLength={6}
                className="flex-1 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || manualPincode.length !== 6}
                className="bg-neutral-800 text-white font-bold rounded-xl text-xs px-4 py-2 hover:bg-neutral-900 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Apply
              </button>
            </div>
          </form>

          {error && (
            <span className="text-[10px] font-semibold text-rose-500 leading-normal text-center mt-1">
              {error}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;

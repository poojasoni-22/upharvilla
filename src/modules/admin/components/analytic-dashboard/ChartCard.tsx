import type React from "react";

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="rounded-xl border border-dashed border-neutral-200 bg-white/90 px-4 py-2.5 text-center">
        <p className="text-xs text-neutral-400">{message}</p>
      </div>
    </div>
  );
}

export function RangeToggle({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex bg-neutral-50 rounded-lg p-0.5 gap-0.5 border border-neutral-200">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer ${
            value === opt.value
              ? "bg-white text-neutral-800 shadow-xs"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

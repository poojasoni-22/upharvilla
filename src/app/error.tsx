"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const REDIRECT_SECONDS = 5;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (countdown <= 0) {
      router.replace("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "var(--font-sans, 'Poppins', sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "16px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
          animation: "popIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Progress bar */}
        <div style={{ height: "3px", background: "#f0ebfa" }}>
          <div
            style={{
              height: "100%",
              background: "#ad8de9",
              animation: `shrink ${REDIRECT_SECONDS}s linear both`,
              transformOrigin: "left",
            }}
          />
        </div>

        {/* Card body */}
        <div style={{ padding: "2.5rem 2rem 2rem" }}>
          {/* Brand mark */}
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ad8de9",
              marginBottom: "1.75rem",
            }}
          >
            upharVilla
          </p>

          {/* Icon */}
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "10px",
              background: "#fdf4ff",
              border: "1px solid #f0e6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ad8de9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "#1a1625",
              marginBottom: "0.5rem",
              lineHeight: 1.3,
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 400,
              color: "#7c6aad",
              lineHeight: 1.6,
              marginBottom: "1.75rem",
            }}
          >
            An unexpected error occurred. We&apos;re taking you back to the home
            page.
          </p>

          {/* Countdown line */}
          <p
            style={{
              fontSize: "0.78rem",
              color: "#a89cc8",
              marginBottom: "1.5rem",
              fontWeight: 500,
            }}
          >
            Redirecting to home in{" "}
            <span style={{ color: "#ad8de9", fontWeight: 600 }}>
              {countdown}s
            </span>
          </p>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <a
              href={`${SITE_URL}/`}
              style={{
                display: "inline-block",
                background: "#ad8de9",
                color: "#fff",
                padding: "0.6rem 1.4rem",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.82rem",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              Back to Home
            </a>
            <button
              type="button"
              onClick={reset}
              style={{
                display: "inline-block",
                background: "transparent",
                color: "#ad8de9",
                padding: "0.6rem 1.4rem",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.82rem",
                border: "1px solid #ad8de9",
                letterSpacing: "0.01em",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

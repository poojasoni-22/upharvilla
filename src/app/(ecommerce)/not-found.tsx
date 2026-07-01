"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const REDIRECT_SECONDS = 5;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export default function EcommerceNotFound() {
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
        minHeight: "60vh",
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

          <p
            style={{
              fontSize: "4.5rem",
              fontWeight: 700,
              color: "#ad8de9",
              lineHeight: 1,
              marginBottom: "0.5rem",
              letterSpacing: "-0.03em",
            }}
          >
            404
          </p>

          <h1
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "#1a1625",
              marginBottom: "0.5rem",
              lineHeight: 1.3,
            }}
          >
            Page not found
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
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>

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

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Link
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
            </Link>
            <Link
              href={`${SITE_URL}/products`}
              style={{
                display: "inline-block",
                background: "transparent",
                color: "#ad8de9",
                padding: "0.6rem 1.4rem",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.82rem",
                textDecoration: "none",
                border: "1px solid #ad8de9",
                letterSpacing: "0.01em",
              }}
            >
              Browse Products
            </Link>
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

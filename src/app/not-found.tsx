"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const REDIRECT_SECONDS = 5;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    document.title = "404 — Page Not Found | upharVilla";
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      router.replace("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white animate-in fade-in duration-300">
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
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "24px",
          boxShadow:
            "0 10px 40px -10px rgba(173,141,233,0.12), 0 1px 3px rgba(0,0,0,0.02)",
          overflow: "hidden",
          animation: "popIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            height: "3.5px",
            background: "#f0ebfa",
            position: "relative",
          }}
        >
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
        <div style={{ padding: "2.5rem 2rem 2.25rem" }}>
          {/* Brand Logo */}
          <div
            style={{
              marginBottom: "1.75rem",
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <Image
              src="/logo.png"
              alt="upharVilla"
              width={140}
              height={41}
              priority
              style={{ objectFit: "contain", height: "30px", width: "auto" }}
            />
          </div>

          {/* 404 */}
          <p
            style={{
              fontSize: "4.5rem",
              fontWeight: 800,
              color: "#ad8de9",
              lineHeight: 1,
              marginBottom: "0.5rem",
              letterSpacing: "-0.04em",
            }}
          >
            404
          </p>

          <h1
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#1a1625",
              marginBottom: "0.5rem",
              lineHeight: 1.3,
              fontFamily: "Poppins, sans-serif",
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
              fontFamily: "Poppins, sans-serif",
            }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>

          {/* Countdown line */}
          <p
            style={{
              fontSize: "0.78rem",
              color: "#a89cc8",
              marginBottom: "1.5rem",
              fontWeight: 500,
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Redirecting to home in{" "}
            <span style={{ color: "#ad8de9", fontWeight: 600 }}>
              {countdown}s
            </span>
          </p>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Link
              href={`${SITE_URL}/`}
              style={{
                display: "inline-block",
                background: "#ad8de9",
                color: "#fff",
                padding: "0.65rem 1.5rem",
                borderRadius: "12px",
                fontWeight: 650,
                fontSize: "0.82rem",
                textDecoration: "none",
                letterSpacing: "0.01em",
                transition: "opacity 0.15s",
                fontFamily: "Poppins, sans-serif",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "0.88")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "1")
              }
            >
              Back to Home
            </Link>
            <Link
              href={`${SITE_URL}/products`}
              style={{
                display: "inline-block",
                background: "transparent",
                color: "#ad8de9",
                padding: "0.65rem 1.5rem",
                borderRadius: "12px",
                fontWeight: 650,
                fontSize: "0.82rem",
                textDecoration: "none",
                border: "1px solid #ad8de9",
                letterSpacing: "0.01em",
                transition: "background 0.15s, color 0.15s",
                fontFamily: "Poppins, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#ad8de9";
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color = "#ad8de9";
              }}
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

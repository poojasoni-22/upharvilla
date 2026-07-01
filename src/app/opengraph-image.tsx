import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "upharVilla — Thoughtful Gifts for Every Occasion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Read the actual logo file and convert to base64 data URL
  const logoBuffer = await readFile(
    join(process.cwd(), "public", "logo-og.png"),
  );
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(145deg, #fff5f7 0%, #fce4ec 30%, #f3e5f5 60%, #ede7f6 100%)",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative soft circles */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -100,
          width: 450,
          height: 450,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(206,147,216,0.2) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -80,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(240,152,174,0.2) 0%, transparent 70%)",
        }}
      />

      {/* Actual logo image */}
      <img
        src={logoBase64}
        width={500}
        height={250}
        style={{
          objectFit: "contain",
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          color: "#6b5b7b",
          marginTop: 8,
          fontWeight: 500,
          letterSpacing: 0.5,
        }}
      >
        Thoughtful Gifts for Every Occasion
      </div>

      {/* Category pills */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 32,
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        {[
          { emoji: "🎨", label: "Customised", bg: "#fce4ec", color: "#c2185b" },
          { emoji: "🎂", label: "Birthday", bg: "#f3e5f5", color: "#7b1fa2" },
          { emoji: "💍", label: "Wedding", bg: "#ede7f6", color: "#512da8" },
          { emoji: "🏢", label: "Corporate", bg: "#e8eaf6", color: "#283593" },
          { emoji: "🎉", label: "Festivals", bg: "#fce4ec", color: "#c2185b" },
        ].map((cat) => (
          <div
            key={cat.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: cat.bg,
              color: cat.color,
              padding: "8px 16px",
              borderRadius: 20,
            }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 15,
          color: "#9b8ba8",
          fontWeight: 600,
        }}
      >
        <span>upharvilla.in</span>
        <span style={{ color: "#d1c4e9" }}>•</span>
        <span>Free Delivery Across India</span>
        <span style={{ color: "#d1c4e9" }}>•</span>
        <span>Navsari, Gujarat</span>
      </div>
    </div>,
    { ...size },
  );
}

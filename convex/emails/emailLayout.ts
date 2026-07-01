// ── UpharVilla Email Shared Layout ──────────────────────────────────────────
// All emails use this base so they look identical to the website brand.
// Primary: #ad8de9 (lavender purple)  Pink: #e87fa6  Dark text: #1a1a2e
//
// Logo is served from the live site — works in all email clients.

import { env } from "../env";

const BASE_URL = env.SITE_URL || "https://uphar-villa.vercel.app";
// logo.png = transparent bg (for gradient headers)
// logo-og.png = white bg square (for light sections / social)
const LOGO_URL = `${BASE_URL}/logo.png`;
const _LOGO_OG_URL = `${BASE_URL}/logo-og.png`;

// Brand tokens — exact values from globals.css
export const B = {
  primary: "#ad8de9",
  primaryDark: "#9370d8",
  pink: "#e87fa6",
  pinkLight: "#fce7f0",
  bg: "#faf9ff",
  white: "#ffffff",
  border: "#ede9f8",
  textDark: "#1a1a2e",
  textMid: "#4a4a6a",
  textLight: "#8b8ba0",
  green: "#22c55e",
  greenBg: "#f0fdf4",
  greenBorder: "#bbf7d0",
  amber: "#f59e0b",
  amberBg: "#fffbeb",
  amberBorder: "#fde68a",
} as const;

// ── Header with logo + gradient ──────────────────────────────────────────────
export function emailHeader(tagline: string): string {
  return `
  <tr>
    <td style="background:linear-gradient(135deg,${B.primary},${B.pink});padding:32px 24px 28px;text-align:center;">
      <img src="${LOGO_URL}" alt="upharVilla" width="160" height="auto"
           style="display:block;margin:0 auto 12px;max-width:160px;height:auto;" />
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.92);font-family:Poppins,Arial,sans-serif;letter-spacing:0.3px;">${tagline}</p>
    </td>
  </tr>`;
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function emailFooter(): string {
  return `
  <tr>
    <td style="background:#f3f0fb;padding:24px;text-align:center;border-top:1px solid ${B.border};">
      <p style="margin:0 0 6px;font-size:12px;color:${B.textLight};font-family:Poppins,Arial,sans-serif;">
        © ${new Date().getFullYear()} upharVilla · The House of Gifts
      </p>
      <p style="margin:0;font-size:12px;color:${B.textLight};font-family:Poppins,Arial,sans-serif;">
        Questions? <a href="mailto:support@upharvilla.in" style="color:${B.primary};text-decoration:none;">support@upharvilla.in</a>
        &nbsp;·&nbsp;
        <a href="${BASE_URL}" style="color:${B.primary};text-decoration:none;">Visit Store</a>
      </p>
    </td>
  </tr>`;
}

// ── CTA Button ────────────────────────────────────────────────────────────────
export function ctaButton(label: string, href: string): string {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
    <tr>
      <td style="background:${B.primary};border-radius:10px;text-align:center;">
        <a href="${href}"
           style="display:inline-block;padding:13px 32px;color:#ffffff;font-family:Poppins,Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

// ── Info row (label + value) ───────────────────────────────────────────────
export function infoRow(label: string, value: string): string {
  return `
  <tr>
    <td style="font-family:Poppins,Arial,sans-serif;font-size:13px;color:${B.textLight};padding:4px 0;width:40%;">${label}</td>
    <td style="font-family:Poppins,Arial,sans-serif;font-size:13px;color:${B.textDark};font-weight:600;padding:4px 0;text-align:right;">${value}</td>
  </tr>`;
}

// ── Product Card — single product with image + details ────────────────────
export function productCard(opts: {
  name: string;
  thumbnail?: string;
  price?: number;
  link?: string;
  subtitle?: string;
  ctaLabel?: string;
}): string {
  const imgCell = opts.thumbnail
    ? `<td width="64" style="padding-right:14px;vertical-align:top;">
         <a href="${opts.link || "#"}" style="text-decoration:none;">
           <img src="${opts.thumbnail}" alt="${opts.name}" width="64" height="64"
                style="border-radius:10px;border:1px solid ${B.border};object-fit:cover;display:block;width:64px;height:64px;" />
         </a>
       </td>`
    : "";

  const priceHtml = opts.price
    ? `<p style="margin:3px 0 0;font-size:14px;font-weight:700;color:${B.primary};font-family:Poppins,Arial,sans-serif;">₹${opts.price.toLocaleString("en-IN")}</p>`
    : "";

  const subtitleHtml = opts.subtitle
    ? `<p style="margin:3px 0 0;font-size:12px;color:${B.textLight};font-family:Poppins,Arial,sans-serif;">${opts.subtitle}</p>`
    : "";

  const ctaHtml =
    opts.ctaLabel && opts.link
      ? `<td style="vertical-align:middle;text-align:right;">
         <a href="${opts.link}" style="display:inline-block;padding:7px 16px;background:${B.primary};color:#ffffff;border-radius:20px;font-size:11px;font-weight:600;text-decoration:none;font-family:Poppins,Arial,sans-serif;white-space:nowrap;">
           ${opts.ctaLabel}
         </a>
       </td>`
      : "";

  return `
  <table cellpadding="0" cellspacing="0" width="100%" style="background:${B.white};border:1px solid ${B.border};border-radius:12px;margin-bottom:10px;border-collapse:collapse;">
    <tr><td style="padding:12px 14px;">
      <table cellpadding="0" cellspacing="0" width="100%"><tr>
        ${imgCell}
        <td style="vertical-align:middle;">
          <p style="margin:0;font-size:13px;font-weight:600;color:${B.textDark};font-family:Poppins,Arial,sans-serif;text-transform:capitalize;">${opts.name}</p>
          ${priceHtml}
          ${subtitleHtml}
        </td>
        ${ctaHtml}
      </tr></table>
    </td></tr>
  </table>`;
}

// ── Product Grid — horizontal row of 1–4 product thumbnails ──────────────
export function productGrid(
  items: Array<{ name: string; thumbnail?: string; link?: string }>,
): string {
  const maxItems = items.slice(0, 4);
  const cols = maxItems
    .map((item) => {
      if (!item.thumbnail) return "";
      return `
      <td style="padding:0 4px;text-align:center;vertical-align:top;width:${Math.floor(100 / maxItems.length)}%;">
        <a href="${item.link || "#"}" style="text-decoration:none;">
          <img src="${item.thumbnail}" alt="${item.name}" width="100" height="100"
               style="border-radius:10px;border:1px solid ${B.border};object-fit:cover;display:block;width:100%;max-width:120px;height:auto;aspect-ratio:1;margin:0 auto;" />
        </a>
        <p style="margin:6px 0 0;font-size:11px;color:${B.textMid};font-family:Poppins,Arial,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.name}</p>
      </td>`;
    })
    .join("");

  if (!cols.trim()) return "";

  return `
  <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
    <tr>${cols}</tr>
  </table>`;
}

// ── Full email wrapper — responsive ────────────────────────────────────────
export function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="x-apple-disable-message-reformatting">
  <title>upharVilla</title>
  <style>
    /* Reset for all email clients */
    body, table, td { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    /* Mobile responsive */
    @media only screen and (max-width: 480px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-body-td { padding: 20px 16px !important; }
      .email-header-td { padding: 24px 16px 20px !important; }
      .email-footer-td { padding: 20px 16px !important; }
      .email-logo { width: 130px !important; }
      .cta-btn { padding: 12px 24px !important; font-size: 13px !important; }
      .heading-text { font-size: 18px !important; }
      .product-img { width: 52px !important; height: 52px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${B.bg};font-family:Poppins,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${B.bg};padding:24px 12px;">
    <tr>
      <td align="center">
        <table class="email-container" width="600" cellpadding="0" cellspacing="0"
               style="background:${B.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(173,141,233,0.10);max-width:600px;width:100%;">
          ${body}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

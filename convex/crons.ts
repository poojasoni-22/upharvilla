import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ── Every 5 minutes — Email queue processor ──────────────────────────────────
crons.interval(
  "process-email-queue",
  { minutes: 5 },
  internal.emails.queue.processQueue,
);

// ── Daily 10:00 AM IST (4:30 AM UTC) — Order packing reminders ───────────────
crons.daily(
  "order-packing-reminders",
  { hourUTC: 4, minuteUTC: 30 },
  internal.emails.reminderEmail.sendOrderReminders,
);

// ── Daily 11:00 AM IST (5:30 AM UTC) — Stale cart follow-ups ─────────────────
crons.daily(
  "cart-followup-emails",
  { hourUTC: 5, minuteUTC: 30 },
  internal.emails.followUpEmail.sendCartFollowUps,
);

// ── Daily 12:00 PM IST (6:30 AM UTC) — Post-delivery thank you ───────────────
crons.daily(
  "thank-you-emails",
  { hourUTC: 6, minuteUTC: 30 },
  internal.emails.thankYouEmail.sendThankYouEmails,
);

// ── Daily 1:00 PM IST (7:30 AM UTC) — Review requests ───────────────────────
crons.daily(
  "review-request-emails",
  { hourUTC: 7, minuteUTC: 30 },
  internal.emails.reviewEmail.sendReviewRequests,
);

// ── Daily 4:00 AM IST (10:30 PM UTC) — Database Garbage Collection ───────────
crons.daily(
  "database-cleanup",
  { hourUTC: 22, minuteUTC: 30 },
  internal.checkout.purgeStaleDatabaseRecords,
);

// ── Every 5 minutes — WhatsApp queue processor ───────────────────────────────
crons.interval(
  "process-whatsapp-queue",
  { minutes: 5 },
  internal.whatsapp.queue.processQueue,
);

// ── Daily 2:00 PM IST (8:30 AM UTC) — Browse abandonment WhatsApp ────────────
crons.daily(
  "browse-abandonment-whatsapp",
  { hourUTC: 8, minuteUTC: 30 },
  internal.whatsapp.orderNotifications.sendBrowseAbandonmentReminders,
);

// ── Daily 11:30 AM IST (6:00 AM UTC) — Cart abandonment WhatsApp ─────────────
crons.daily(
  "cart-abandonment-whatsapp",
  { hourUTC: 6, minuteUTC: 0 },
  internal.whatsapp.orderNotifications.sendCartAbandonmentReminders,
);

export default crons;

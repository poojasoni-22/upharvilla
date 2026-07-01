import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";

import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth as any,
  {
    local: { schema },
    verbose: false,
  },
);

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const providers: BetterAuthOptions["socialProviders"] = {};

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  const baseURL =
    process.env.SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  // Dynamically build trusted origins from SITE_URL — no hardcoding needed
  const trustedOrigins = Array.from(
    new Set([baseURL, "http://localhost:3000"].filter(Boolean)),
  );

  return {
    appName: "upharvilla",
    baseURL: baseURL,
    trustedOrigins: trustedOrigins,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      async sendResetPassword({ user, url }) {
        const siteUrl =
          process.env.SITE_URL || "https://uphar-villa.vercel.app";
        const logoUrl = `${siteUrl}/logo.png`;
        if (process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "upharVilla Support <support@upharvilla.in>",
            to: user.email,
            subject: "Reset your password — upharVilla",
            html: `
              <div style="font-family: 'Segoe UI', sans-serif; padding: 0; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ede9f8; border-radius: 12px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #ad8de9, #e87fa6); padding: 28px 24px; text-align: center;">
                  <img src="${logoUrl}" alt="upharVilla" style="height: 44px;" />
                </div>
                <div style="padding: 32px 24px;">
                  <h2 style="color: #1a1a2e; margin: 0 0 16px; font-family: Poppins, 'Segoe UI', sans-serif;">Reset Your Password</h2>
                  <p style="color: #4a4a6a; line-height: 1.6;">Hello ${user.name},</p>
                  <p style="color: #4a4a6a; line-height: 1.6;">We received a request to reset your password for your upharVilla account. Click the button below to set a new password:</p>
                  <div style="margin: 32px 0; text-align: center;">
                    <a href="${url}" style="display: inline-block; padding: 14px 32px; background: #ad8de9; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">Reset Password</a>
                  </div>
                  <p style="color: #8b8ba0; font-size: 14px; line-height: 1.6;">If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
                </div>
                <div style="background-color: #faf9ff; padding: 16px 24px; text-align: center; border-top: 1px solid #ede9f8;">
                  <p style="color: #8b8ba0; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} upharVilla · The House of Gifts</p>
                </div>
              </div>
            `,
          });
        } else {
          console.warn(
            "No RESEND_API_KEY found. Reset URL:",
            url,
            "for",
            user.email,
          );
        }
      },
    },
    socialProviders: providers,
    account: {
      accountLinking: {
        enabled: true,
      },
    },

    plugins: [
      convex({ authConfig }) as any,
      emailOTP({
        sendVerificationOnSignUp: true,
        async sendVerificationOTP({ email, otp, type }) {
          const siteUrl =
            process.env.SITE_URL || "https://uphar-villa.vercel.app";
          const logoUrl = `${siteUrl}/logo.png`;
          if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const isReset = type === "forget-password";

            await resend.emails.send({
              from: isReset
                ? "upharVilla Support <support@upharvilla.in>"
                : "upharVilla <hello@upharvilla.in>",
              to: email,
              subject: isReset
                ? "Reset your password — upharVilla"
                : "Your OTP for upharVilla",
              html: isReset
                ? `
                <div style="font-family: 'Segoe UI', sans-serif; padding: 0; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ede9f8; border-radius: 12px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #ad8de9, #e87fa6); padding: 28px 24px; text-align: center;">
                    <img src="${logoUrl}" alt="upharVilla" style="height: 44px;" />
                  </div>
                  <div style="padding: 32px 24px;">
                    <h2 style="color: #1a1a2e; margin: 0 0 16px; font-family: Poppins, 'Segoe UI', sans-serif;">Password Reset Request</h2>
                    <p style="color: #4a4a6a; line-height: 1.6;">Your 6-digit verification code is:</p>
                    <div style="margin: 24px 0; text-align: center;">
                      <span style="font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #ad8de9; padding: 16px 32px; background-color: #faf9ff; border-radius: 12px; display: inline-block; border: 1px solid #ede9f8;">${otp}</span>
                    </div>
                    <p style="color: #8b8ba0; font-size: 14px; line-height: 1.6;">Enter this code on the reset page. If you didn't request this, ignore this email.</p>
                  </div>
                  <div style="background-color: #faf9ff; padding: 16px 24px; text-align: center; border-top: 1px solid #ede9f8;">
                    <p style="color: #8b8ba0; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} upharVilla · The House of Gifts</p>
                  </div>
                </div>
              `
                : `
                <div style="font-family: 'Segoe UI', sans-serif; padding: 0; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ede9f8; border-radius: 12px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #ad8de9, #e87fa6); padding: 28px 24px; text-align: center;">
                    <img src="${logoUrl}" alt="upharVilla" style="height: 44px;" />
                  </div>
                  <div style="padding: 32px 24px;">
                    <h2 style="color: #1a1a2e; margin: 0 0 16px; font-family: Poppins, 'Segoe UI', sans-serif;">Welcome to upharVilla! 🎉</h2>
                    <p style="color: #4a4a6a; line-height: 1.6;">Your verification code is:</p>
                    <div style="margin: 24px 0; text-align: center;">
                      <span style="font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #ad8de9; padding: 16px 32px; background-color: #faf9ff; border-radius: 12px; display: inline-block; border: 1px solid #ede9f8;">${otp}</span>
                    </div>
                    <p style="color: #8b8ba0; font-size: 14px; line-height: 1.6;">This code will expire shortly. Do not share it with anyone.</p>
                  </div>
                  <div style="background-color: #faf9ff; padding: 16px 24px; text-align: center; border-top: 1px solid #ede9f8;">
                    <p style="color: #8b8ba0; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} upharVilla · The House of Gifts</p>
                  </div>
                </div>
              `,
            });
          } else {
            console.warn(
              `No RESEND_API_KEY found. Simulated OTP (${type}):`,
              otp,
              "for",
              email,
            );
          }
        },
      }),
    ],
  } satisfies BetterAuthOptions;
};

// For `auth` CLI
export const options = createAuthOptions({} as GenericCtx<DataModel>);

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};

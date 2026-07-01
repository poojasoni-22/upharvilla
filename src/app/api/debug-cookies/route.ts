import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Temporary debug endpoint — remove after fixing auth
export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // List all cookie names (not values for security)
  const cookieNames = allCookies.map((c) => c.name);

  // Check specific Better Auth cookies
  const checks = {
    "better-auth.session_token": !!cookieStore.get("better-auth.session_token")
      ?.value,
    "better-auth-session_token": !!cookieStore.get("better-auth-session_token")
      ?.value,
    "__Secure-better-auth.session_token": !!cookieStore.get(
      "__Secure-better-auth.session_token",
    )?.value,
    "__Secure-better-auth-session_token": !!cookieStore.get(
      "__Secure-better-auth-session_token",
    )?.value,
  };

  return NextResponse.json({
    totalCookies: allCookies.length,
    cookieNames,
    sessionChecks: checks,
  });
}

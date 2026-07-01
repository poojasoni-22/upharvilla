import { getUploadAuthParams } from "@imagekit/next/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Better Auth cookie names — checks dot & hyphen variants + Secure prefix
const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "better-auth-session_token",
  "__Secure-better-auth.session_token",
  "__Secure-better-auth-session_token",
];

export async function GET() {
  const cookieStore = await cookies();
  const hasSession = SESSION_COOKIE_NAMES.some(
    (name) => !!cookieStore.get(name)?.value,
  );

  if (!hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

  if (!privateKey || !publicKey) {
    return NextResponse.json(
      { error: "ImageKit keys not configured" },
      { status: 500 },
    );
  }

  const { token, expire, signature } = getUploadAuthParams({
    privateKey,
    publicKey,
  });

  return NextResponse.json({
    token,
    expire,
    signature,
    publicKey,
  });
}

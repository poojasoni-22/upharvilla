import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getImageKit } from "@/lib/ImageKit";

// Better Auth cookie names — checks dot & hyphen variants + Secure prefix
const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "better-auth-session_token",
  "__Secure-better-auth.session_token",
  "__Secure-better-auth-session_token",
];

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const hasSession = SESSION_COOKIE_NAMES.some(
    (name) => !!cookieStore.get(name)?.value,
  );

  if (!hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const parts = url.split("/");
    const fileName = parts[parts.length - 1];

    if (!fileName) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    const files = await getImageKit().listFiles({
      searchQuery: `name = "${fileName}"`,
    });

    if (files && files.length > 0) {
      // @ts-expect-error
      await getImageKit().deleteFile(files[0].fileId);
      return NextResponse.json({
        success: true,
        message: "File deleted from ImageKit",
      });
    }

    return NextResponse.json({
      success: true,
      message: "File not found on ImageKit, skipped deletion",
    });
  } catch (error: unknown) {
    console.error("ImageKit delete error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

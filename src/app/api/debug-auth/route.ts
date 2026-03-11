import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    session: session ? {
      user: {
        email: session.user?.email,
        name: session.user?.name,
      },
      expires: session.expires,
    } : null,
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL,
      PORT: process.env.PORT,
    },
    headers: {
      host: typeof window === "undefined" ? "server-side" : "client-side",
    }
  });
}

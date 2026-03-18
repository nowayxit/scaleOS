import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    // Columns are global in current schema — return all, ordered
    const columns = await prisma.column.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(columns);
  } catch (error) {
    console.error("[COLUMNS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

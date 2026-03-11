import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const sessions = await prisma.optimizationSession.findMany({
      where: { clientId },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching optimization sessions:", error);
    return NextResponse.json({ error: "Failed to fetch optimization sessions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, insight, completedRoutines } = body;

    if (!clientId || !insight) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const optimizationSession = await prisma.optimizationSession.create({
      data: {
        clientId,
        insight,
        completedRoutines: completedRoutines ? JSON.stringify(completedRoutines) : null,
      }
    });

    // Also update the client's pending insight and last optimization date
    await prisma.client.update({
      where: { id: clientId },
      data: {
        pendingInsight: insight,
        lastOptimization: "Agora mesmo"
      }
    });

    return NextResponse.json(optimizationSession, { status: 201 });
  } catch (error) {
    console.error("Error creating optimization session:", error);
    return NextResponse.json({ error: "Failed to create optimization session" }, { status: 500 });
  }
}

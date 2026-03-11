import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const agencyId = (session.user as any).agencyId;
    if (!agencyId) return new NextResponse("No Agency Found", { status: 404 });

    const body = await req.json();
    const { title, hypothesis, result, type, clientId } = body;

    // Security check
    if (clientId) {
        const client = await prisma.client.findFirst({
            where: { id: clientId, agencyId }
        });
        if (!client) {
            return new NextResponse("Client not found or authorized", { status: 403 });
        }
    } else {
        return new NextResponse("Client ID required", { status: 400 });
    }

    const log = await prisma.decisionLog.create({
      data: {
        title,
        hypothesis,
        result,
        type: type || "strategy",
        clientId,
      }
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("[DECISION_LOGS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

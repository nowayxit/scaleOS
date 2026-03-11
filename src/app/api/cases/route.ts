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
    const { clientName, strategy, investment, revenue, roi, notes, clientId } = body;

    // Security check
    if (clientId) {
        const client = await prisma.client.findFirst({
            where: { id: clientId, agencyId }
        });
        if (!client) {
            return new NextResponse("Client not found or authorized", { status: 403 });
        }
    }

    const clientCase = await prisma.clientCase.create({
      data: {
        clientName,
        strategy,
        investment: Number(investment) || 0,
        revenue: Number(revenue) || 0,
        roi: Number(roi) || 0,
        notes: notes || "",
        clientId,
      }
    });

    return NextResponse.json(clientCase);
  } catch (error) {
    console.error("[CASES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

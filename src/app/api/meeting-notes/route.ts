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

    const agencyId = (session.user as any).currentAgencyId;
    if (!agencyId) return new NextResponse("No Agency Found", { status: 404 });

    const body = await req.json();
    const { subject, content, clientId } = body;

    // Security check
    if (clientId) {
        const client = await prisma.client.findFirst({
            where: { id: clientId, agencyId: agencyId }
        });
        if (!client) {
            return new NextResponse("Client not found or authorized", { status: 403 });
        }
    } else {
        return new NextResponse("Client ID required", { status: 400 });
    }

    const note = await prisma.meetingNote.create({
      data: {
        subject,
        content,
        clientId,
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[MEETING_NOTES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

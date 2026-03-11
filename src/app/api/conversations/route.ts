import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/conversations — list user's conversations in the active workspace
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;
    const agencyId = (session.user as any).currentAgencyId;
    if (!agencyId) return new NextResponse("No Agency Found", { status: 404 });

    const conversations = await prisma.conversation.findMany({
      where: {
        agencyId,
        members: { some: { userId } }
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true } } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { user: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(conversations);
  } catch (e) {
    console.error("[CONVERSATIONS_GET]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/conversations — create DM or group
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;
    const agencyId = (session.user as any).currentAgencyId;
    if (!agencyId) return new NextResponse("No Agency Found", { status: 404 });

    const { type, name, memberIds } = await req.json();
    // memberIds: array of user IDs to add (not including self for DM flow check)

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return new NextResponse("memberIds required", { status: 400 });
    }

    // For DMs: check if conversation already exists between these two users
    if (type === 'direct') {
      const otherId = memberIds[0];
      const existing = await prisma.conversation.findFirst({
        where: {
          agencyId,
          type: 'direct',
          AND: [
            { members: { some: { userId } } },
            { members: { some: { userId: otherId } } }
          ]
        }
      });
      if (existing) return NextResponse.json(existing);
    }

    // Create the conversation
    const allMemberIds = Array.from(new Set([userId, ...memberIds]));
    const conversation = await prisma.conversation.create({
      data: {
        type: type || 'direct',
        name: type === 'group' ? name : null,
        agencyId,
        members: {
          create: allMemberIds.map((id: string) => ({ userId: id }))
        }
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true } } }
        },
        messages: true
      }
    });

    return NextResponse.json(conversation);
  } catch (e) {
    console.error("[CONVERSATIONS_POST]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

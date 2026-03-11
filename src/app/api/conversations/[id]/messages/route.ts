import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/conversations/[id]/messages
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id: conversationId } = await params;
    const userId = (session.user as any).id;

    // Verify membership
    const member = await prisma.conversationMember.findFirst({
      where: { conversationId, userId }
    });
    if (!member) return new NextResponse("Forbidden", { status: 403 });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100
    });

    return NextResponse.json(messages);
  } catch (e) {
    console.error("[MESSAGES_GET]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/conversations/[id]/messages
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id: conversationId } = await params;
    const userId = (session.user as any).id;

    const member = await prisma.conversationMember.findFirst({
      where: { conversationId, userId }
    });
    if (!member) return new NextResponse("Forbidden", { status: 403 });

    const { content } = await req.json();
    if (!content?.trim()) return new NextResponse("Content required", { status: 400 });

    const message = await prisma.message.create({
      data: { content: content.trim(), conversationId, userId },
      include: { user: { select: { id: true, name: true, image: true } } }
    });

    return NextResponse.json(message);
  } catch (e) {
    console.error("[MESSAGES_POST]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

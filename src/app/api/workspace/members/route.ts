import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const agencyId = (session.user as any).currentAgencyId;
    if (!agencyId) return new NextResponse("No Agency", { status: 404 });

    const members = await prisma.workspaceMember.findMany({
      where: { agencyId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, role: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("[MEMBERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const requesterId = (session.user as any).id;
    const agencyId = (session.user as any).currentAgencyId;
    if (!agencyId) return new NextResponse("No Agency", { status: 404 });

    // Check if requester is OWNER or ADMIN
    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { userId_agencyId: { userId: requesterId, agencyId } }
    });
    if (!requesterMembership || !["OWNER", "ADMIN"].includes(requesterMembership.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { email, role = "MEMBER" } = body;

    if (!email) return new NextResponse("Email is required", { status: 400 });

    // Find the user by email
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return NextResponse.json({ error: "Nenhum usuário encontrado com esse e-mail. Peça para ele criar uma conta primeiro." }, { status: 404 });
    }

    // Check if they are already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: { userId_agencyId: { userId: targetUser.id, agencyId } }
    });
    if (existing) {
      return NextResponse.json({ error: "Este usuário já é membro do espaço." }, { status: 409 });
    }

    const member = await prisma.workspaceMember.create({
      data: { userId: targetUser.id, agencyId, role },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } }
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("[MEMBERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const requesterId = (session.user as any).id;
    const agencyId = (session.user as any).currentAgencyId;
    if (!agencyId) return new NextResponse("No Agency", { status: 404 });

    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { userId_agencyId: { userId: requesterId, agencyId } }
    });
    if (!requesterMembership || requesterMembership.role !== "OWNER") {
      return new NextResponse("Forbidden – apenas o OWNER pode remover membros", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");
    if (!targetUserId) return new NextResponse("userId is required", { status: 400 });
    if (targetUserId === requesterId) return new NextResponse("Você não pode remover a si mesmo", { status: 400 });

    await prisma.workspaceMember.delete({
      where: { userId_agencyId: { userId: targetUserId, agencyId } }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[MEMBERS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

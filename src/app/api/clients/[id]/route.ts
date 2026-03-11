import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const agencyId = (session.user as any).agencyId;
    if (!agencyId) return new NextResponse("No Agency Found", { status: 404 });

    const { id } = await params;
    if (!id) return new NextResponse("Client ID Requirido", { status: 400 });

    const client = await prisma.client.findFirst({
      where: { id, agencyId }
    });

    if (!client) {
      return new NextResponse("Cliente não encontrado ou não autorizado", { status: 404 });
    }

    await prisma.client.delete({
      where: { id }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[CLIENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const agencyId = (session.user as any).agencyId;
    if (!agencyId) return new NextResponse("No Agency Found", { status: 404 });

    const { id } = await params;
    if (!id) return new NextResponse("Client ID Requirido", { status: 400 });

    const body = await req.json();

    const existingClient = await prisma.client.findFirst({
        where: { id, agencyId }
    });
  
    if (!existingClient) {
        return new NextResponse("Cliente não encontrado ou não autorizado", { status: 404 });
    }

    const client = await prisma.client.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("[CLIENT_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

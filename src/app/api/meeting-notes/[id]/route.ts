import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    if (!id) return new NextResponse("Note ID required", { status: 400 });

    const body = await req.json();

    const note = await prisma.meetingNote.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[MEETING_NOTE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    if (!id) return new NextResponse("Note ID required", { status: 400 });

    await prisma.meetingNote.delete({
      where: { id }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[MEETING_NOTE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

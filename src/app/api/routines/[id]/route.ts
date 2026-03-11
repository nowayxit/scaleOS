import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    if (!id) return new NextResponse("Routine ID required", { status: 400 });

    const body = await req.json();

    const routine = await prisma.routine.update({
      where: { id },
      data: Object.keys(body).includes('done') ? { done: body.done } : body,
    });

    return NextResponse.json(routine);
  } catch (error) {
    console.error("[ROUTINE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    if (!id) return new NextResponse("Routine ID required", { status: 400 });

    await prisma.routine.delete({
      where: { id }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[ROUTINE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

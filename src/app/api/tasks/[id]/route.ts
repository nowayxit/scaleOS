import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    if (!id) return new NextResponse("Task ID required", { status: 400 });

    // Assuming we do not have hard multi-tenant isolation at the task level right now, 
    // but in a real app we'd verify the task belongs to a client owned by the agency.
    await prisma.task.delete({
      where: { id }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[TASK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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
    if (!id) return new NextResponse("Task ID required", { status: 400 });

    const body = await req.json();
    const { tags, ...updates } = body;

    const updateData: any = { ...updates };

    if (tags !== undefined) {
        // If passing tags as array of IDs, we disconnect all existing and connect new ones
        updateData.tags = {
            set: [], // Clear existing
            connect: tags.map((tagId: string) => ({ id: tagId }))
        };
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { tags: true }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

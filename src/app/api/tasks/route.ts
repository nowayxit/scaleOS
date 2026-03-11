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
    const { title, description, priority, dueDate, columnId, clientId, tags } = body;

    // Security check: verify if the client belongs to the agency
    if (clientId) {
        const client = await prisma.client.findFirst({
            where: { id: clientId, agencyId }
        });
        if (!client) {
            return new NextResponse("Client not found or authorized", { status: 403 });
        }
    }

    const taskData: any = {
      title,
      description,
      priority: priority || "medium",
      dueDate,
      columnId,
      clientId,
    };

    // Assuming tags are passed as an array of tag IDs
    if (tags && tags.length > 0) {
        taskData.tags = {
            connect: tags.map((tagId: string) => ({ id: tagId }))
        };
    }

    const task = await prisma.task.create({
      data: taskData,
      include: { tags: true }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

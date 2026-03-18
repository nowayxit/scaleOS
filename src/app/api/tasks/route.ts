import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Helper: ensure default columns exist and return the first one
async function ensureDefaultColumns() {
  let columns = await prisma.column.findMany({ orderBy: { order: "asc" } });
  if (columns.length === 0) {
    // Create default columns if none exist yet
    await prisma.column.createMany({
      data: [
        { title: "A Fazer", order: 0 },
        { title: "Em Progresso", order: 1 },
        { title: "Concluído", order: 2 },
      ]
    });
    columns = await prisma.column.findMany({ orderBy: { order: "asc" } });
  }
  return columns;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const agencyId = (session.user as any).currentAgencyId;
    if (!agencyId) return new NextResponse("No Agency Found", { status: 404 });

    const body = await req.json();
    const { title, description, priority, dueDate, columnId, clientId, tags } = body;

    // Security check: verify if the client belongs to the agency
    if (clientId) {
        const client = await prisma.client.findFirst({
            where: { id: clientId, agencyId: agencyId }
        });
        if (!client) {
            return new NextResponse("Client not found or authorized", { status: 403 });
        }
    }

    // Resolve columnId — if it's missing or doesn't exist in DB, use first real column
    let resolvedColumnId = columnId;
    if (columnId) {
      const col = await prisma.column.findUnique({ where: { id: columnId } });
      if (!col) {
        resolvedColumnId = null; // column ID is invalid (fake local ID)
      }
    }

    if (!resolvedColumnId) {
      const columns = await ensureDefaultColumns();
      resolvedColumnId = columns[0].id;
    }

    const taskData: any = {
      title,
      priority: priority || "medium",
      columnId: resolvedColumnId,
    };

    if (description) taskData.description = description;
    if (dueDate) taskData.dueDate = dueDate;
    if (clientId) taskData.clientId = clientId;

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

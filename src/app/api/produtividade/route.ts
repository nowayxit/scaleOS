import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const agencyId = (session.user as any).currentAgencyId;
    if (!agencyId) return new NextResponse("No Agency", { status: 404 });

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");
    const since = subDays(new Date(), days);

    // 1. Get all workspace members with user info
    const members = await prisma.workspaceMember.findMany({
      where: { agencyId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    // 2. Get all clients in this agency (they are shared)
    const clients = await prisma.client.findMany({
      where: { agencyId },
      select: { id: true, name: true, healthStatus: true }
    });

    // 3. Get all completed tasks in the agency within the period
    // A task is "done" if it's in a column with "Concluído" / "Done" / "Feito" in the title
    const allColumns = await prisma.column.findMany({});
    const doneColumns = allColumns.filter(c => {
      const t = c.title.toLowerCase();
      return t.includes("conclu") || t.includes("done") || t.includes("feito");
    });
    const doneColumnIds = doneColumns.map(c => c.id);

    const completedTasks = await prisma.task.findMany({
      where: {
        columnId: { in: doneColumnIds },
        client: { agencyId },
        createdAt: { gte: since }
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        dueDate: true,
        clientId: true,
        client: { select: { healthStatus: true } }
      }
    });

    // Calculate avg task duration (days from createdAt to dueDate if available)
    const tasksWithDuration = completedTasks
      .filter(t => t.dueDate)
      .map(t => {
        const dueMs = new Date(t.dueDate!).getTime();
        const createdMs = t.createdAt.getTime();
        const durationDays = Math.max(0, (dueMs - createdMs) / (1000 * 60 * 60 * 24));
        return { ...t, durationDays };
      });

    const avgDuration = tasksWithDuration.length > 0
      ? tasksWithDuration.reduce((s, t) => s + t.durationDays, 0) / tasksWithDuration.length
      : null;

    const quickTasks = tasksWithDuration.filter(t => t.durationDays <= 2).length;
    const longTasks = tasksWithDuration.filter(t => t.durationDays > 2).length;

    // 4. Client health summary
    const healthSummary = {
      critical: clients.filter(c => c.healthStatus === "critical").length,
      warning: clients.filter(c => c.healthStatus === "warning").length,
      good: clients.filter(c => c.healthStatus === "good").length,
      total: clients.length,
    };

    // 5. Per-member stats — since tasks don't have assignedUserId yet, we share equally
    // Each member "owns" all workspace clients, show individual health counts
    const membersStats = members.map(m => ({
      userId: m.user.id,
      name: m.user.name || m.user.email,
      role: m.role,
      clients: {
        critical: healthSummary.critical,
        warning: healthSummary.warning,
        good: healthSummary.good,
        total: healthSummary.total,
      },
      completedTasksCount: completedTasks.length,
    }));

    return NextResponse.json({
      period: days,
      healthSummary,
      completedTasks: completedTasks.length,
      quickTasks,
      longTasks,
      avgDuration,
      members: membersStats,
      clients,
    });
  } catch (error) {
    console.error("[PRODUTIVIDADE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

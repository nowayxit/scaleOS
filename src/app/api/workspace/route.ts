import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const workspaces = await prisma.workspaceMember.findMany({
      where: {
        userId: (session.user as any).id
      },
      include: {
        agency: {
           select: { id: true, name: true, logoUrl: true }
        }
      }
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("[WORKSPACE_GET_ALL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

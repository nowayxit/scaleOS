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

    const { targetAgencyId } = await req.json();

    if (!targetAgencyId) {
        return new NextResponse("Target agency is required", { status: 400 });
    }

    // Verify if the user is actually a member of this target workspace
    const membership = await prisma.workspaceMember.findFirst({
        where: {
            userId: (session.user as any).id,
            agencyId: targetAgencyId
        }
    });

    if (!membership) {
         return new NextResponse("Unauthorized to access this workspace", { status: 403 });
    }

    // Update the user's active workspace preference
    const user = await prisma.user.update({
        where: { id: (session.user as any).id },
        data: { currentAgencyId: targetAgencyId }
    });

    return NextResponse.json({ success: true, currentAgencyId: user.currentAgencyId });
  } catch (error) {
    console.error("[WORKSPACE_SWITCH_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

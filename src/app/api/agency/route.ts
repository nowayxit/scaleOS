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

    const agencyId = (session.user as any).currentAgencyId;
    if (!agencyId) return new NextResponse("No Agency Found", { status: 404 });

    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      include: {
        _count: {
          select: { clients: true }
        }
      }
    });

    return NextResponse.json(agency);
  } catch (error) {
    console.error("[AGENCY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const agencyId = (session.user as any).currentAgencyId;
      if (!agencyId) return new NextResponse("No Agency Found", { status: 404 });
  
      const body = await req.json();
      const { name, logoUrl, defaultRoutines } = body;
  
      const agency = await prisma.agency.update({
        where: { id: agencyId },
        data: { 
            name, 
            logoUrl,
            ...(defaultRoutines !== undefined && { defaultRoutines })
        }
      });
  
      // Also update the User name to reflect the Agency change mostly for the UI display
      await prisma.user.updateMany({
        where: { currentAgencyId: agencyId, id: (session.user as any).id },
        data: { name }
      });

      return NextResponse.json(agency);
    } catch (error) {
      console.error("[AGENCY_PATCH]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
}

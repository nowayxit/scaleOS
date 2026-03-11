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

    const clients = await prisma.client.findMany({
      where: { agencyId },
      include: {
        routines: true,
        meetingNotes: {
            orderBy: { date: 'desc' }
        },
        decisionLogs: {
            orderBy: { date: 'desc' }
        },
        cases: true,
        tasks: {
            include: {
                tags: true
            }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("[CLIENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
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
    const { 
        name, niche, budget, targetCpa, currency, healthStatus,
        adsManagerUrl, ga4Url, lookerUrl, driveFolderUrl
    } = body;

    if (!name || !niche || budget === undefined || targetCpa === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const agency = await prisma.agency.findUnique({
        where: { id: agencyId },
        select: { defaultRoutines: true }
    });

    let routinesToCreate = [
        { label: 'Verificar Frequência Analítica (> 4)', done: false, platform: 'meta' },
        { label: 'Analisar Hook Rate dos Top 3 Vídeos (> 18%)', done: false, platform: 'meta' },
        { label: 'Checar CPL histórico vs. CPL atual', done: false, platform: 'meta' },
        { label: 'Verificar Lead Form / LP (taxa de conversão)', done: false, platform: 'meta' },
        { label: 'Negativação de palavras-chave irrelevantes', done: false, platform: 'google' },
        { label: 'Checar Parcela de Impressão (IS)', done: false, platform: 'google' },
        { label: 'Revisar extensões de anúncio ativas', done: false, platform: 'google' },
        { label: 'Confirmar que o pixel está disparando corretamente', done: false, platform: 'geral' },
    ];

    if (agency?.defaultRoutines) {
        try {
            const parsed = JSON.parse(agency.defaultRoutines);
            if (Array.isArray(parsed) && parsed.length > 0) {
                routinesToCreate = parsed.map((r: any) => ({
                    label: r.label,
                    platform: r.platform,
                    done: false
                }));
            }
        } catch(e) {
            console.error("Could not parse default routines during client creation", e);
        }
    }

    const client = await prisma.client.create({
      data: {
        name,
        niche,
        budget: Number(budget),
        currentSpend: 0,
        targetCpa: Number(targetCpa),
        currency: currency || "BRL",
        healthStatus: healthStatus || "good",
        adsManagerUrl: adsManagerUrl || null,
        ga4Url: ga4Url || null,
        lookerUrl: lookerUrl || null,
        driveFolderUrl: driveFolderUrl || null,
        agencyId,
        routines: {
            create: routinesToCreate
        }
      },
      include: {
          routines: true
      }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("[CLIENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

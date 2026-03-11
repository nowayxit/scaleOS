import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email já cadastrado" }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and a default agency for them
    const newAgency = await prisma.agency.create({
      data: {
        name: `Agência de ${name || cleanEmail.split('@')[0]}`,
        plan: "agency",
      }
    });

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: name,
        password: hashedPassword,
        agencyId: newAgency.id,
        role: "ADMIN",
      }
    });

    // --- ONBOARDING: Create Model Client & Data ---
    const modelClient = await prisma.client.create({
      data: {
        name: "Cliente Modelo - ScaleOS",
        niche: "E-commerce",
        budget: 15000,
        currentSpend: 0,
        targetCpa: 45,
        currency: "BRL",
        healthStatus: "good",
        agencyId: newAgency.id,
        routines: {
          create: [
            { label: 'Verificar Frequência Analítica (> 4)', done: false, platform: 'meta' },
            { label: 'Analisar Hook Rate dos Top 3 Vídeos (> 18%)', done: false, platform: 'meta' },
            { label: 'Negativação de palavras-chave irrelevantes', done: false, platform: 'google' }
          ]
        },
        decisionLogs: {
          create: [
            {
              title: 'Troca de Landing Page',
              hypothesis: 'LP longa estava perdendo tráfego mobile.',
              result: 'CPL caiu 30% em 7 dias.',
              type: 'strategy',
            }
          ]
        }
      }
    });

    // Create default Kanban Columns if they don't exist (shared globally or just one-off for now)
    let backlogCol = await prisma.column.findFirst({ where: { title: "A Fazer" } });
    if (!backlogCol) {
      backlogCol = await prisma.column.create({ data: { title: "A Fazer", order: 0 } });
      await prisma.column.create({ data: { title: "Em Progresso", order: 1 } });
      await prisma.column.create({ data: { title: "Concluído", order: 2 } });
    }

    // Assign a Task to the Model Client
    await prisma.task.create({
      data: {
        title: "Revisar estrutura de campanhas",
        description: "Análise inicial das campanhas no ar.",
        priority: "high",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        clientId: modelClient.id,
        columnId: backlogCol.id,
      }
    });
    // ----------------------------------------------

    return NextResponse.json({ message: "User registered successfully", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Ocorreu um erro no servidor" }, { status: 500 });
  }
}

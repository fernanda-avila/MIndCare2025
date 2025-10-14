import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 GET - Lista todos os profissionais
export async function GET(_req: NextRequest) {
  try {
    const professionals = await prisma.professional.findMany();
    return NextResponse.json(professionals, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao buscar profissionais:", error);
    return NextResponse.json(
      { error: "Erro ao buscar profissionais" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 🔹 POST - Cria um novo profissional
export async function POST(req: NextRequest) {
  try {
    const { name, specialty, photo, experience, rating } = await req.json();

    if (!name || !specialty) {
      return NextResponse.json(
        { error: "Nome e especialidade são obrigatórios" },
        { status: 400 }
      );
    }

    const professional = await prisma.professional.create({
      data: {
        name,
        specialty,
      },
    });

    return NextResponse.json(professional, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar profissional:", error);
    return NextResponse.json(
      { error: "Erro ao criar profissional" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

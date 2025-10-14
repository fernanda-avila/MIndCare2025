import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { userId, professionalId, date, time } = await req.json();
  if (!userId || !professionalId || !date || !time) {
    return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 });
  }
  const appointment = await prisma.appointment.create({
    data: {
      userId,
      professionalId,
      date: date,
      time,
    },
  });
  return NextResponse.json(appointment, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json([], { status: 200 });
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: { professional: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(appointments, { status: 200 });
}

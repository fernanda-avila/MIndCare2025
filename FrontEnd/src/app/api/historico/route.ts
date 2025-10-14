import { NextRequest, NextResponse } from "next/server";

let historico: any[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }
  const userHistorico = historico.filter((msg) => msg.userId === userId);
  return NextResponse.json(userHistorico, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  historico.push({
    id: Date.now(),
    texto: body.text,
    remetente: body.sender,
    criadoEm: body.timestamp || new Date(),
    userId: body.userId || "anonymous",
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
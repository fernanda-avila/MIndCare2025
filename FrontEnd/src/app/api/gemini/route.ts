import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt || "";

    // Resposta mock — em produção isso chamaria o serviço externo (Gemini/OpenAI)
    const responseText = `Resposta automática: ${prompt.slice(0, 200)}${prompt.length > 200 ? '...' : ''}`;

    return NextResponse.json({ text: responseText }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao processar prompt' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ text: 'API Gemini mock ativa' }, { status: 200 });
}

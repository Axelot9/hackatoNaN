import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { reply } = await request.json().catch(() => ({ reply: "" }));

  return NextResponse.json({
    sessionId: id,
    analysis: "Análisis de puntos débiles — stub para Day 4",
    weaknesses: ["stub"],
    recommendation: "stub",
    counterReply: "stub",
  });
}
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    sessionId: id,
    analysis: "Análisis de puntos débiles — stub para Day 4",
    weaknesses: ["stub"],
    recommendation: "stub",
    counterReply: "stub",
  });
}

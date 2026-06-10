import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    sessionId: id,
    claim: "RECLAMACIÓN FORMAL — stub para Day 3",
    summary: "Resumen del caso — stub",
    timeline: [],
    nextSteps: ["stub"],
    checklist: "stub",
  });
}

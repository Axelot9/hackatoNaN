import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    sessionId: id,
    counterReply: "Contrarespuesta firme — stub para Day 4",
    legalBasis: "Fundamento legal — stub",
  });
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: session.id,
    claimType: session.claimType,
    claimTypeLabel: session.claimTypeLabel,
    score: session.score,
    checklist: session.checklist,
    extractedData: session.extractedData,
    evidence: session.evidence,
    timeline: session.timeline,
    companyResponse: session.companyResponse,
    claimGenerated: session.claimGenerated,
  });
}

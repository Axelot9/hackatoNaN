import { NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import { generateClaim } from "@/lib/ai";
import { buildClaimGenerationPrompt } from "@/lib/prompts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const prompt = buildClaimGenerationPrompt(
    session.claimType || "other",
    session.extractedData.problema as string || "",
    session.extractedData,
    session.evidence,
    session.timeline
  );

  const claim = await generateClaim(prompt);

  return NextResponse.json({
    sessionId: id,
    claim,
    summary: "Reclamación generada con éxito.",
    timeline: session.timeline,
    nextSteps: ["Envía la reclamación por correo certificado o email con acuse de recibo."],
    checklist: "Caso completo.",
  });
}

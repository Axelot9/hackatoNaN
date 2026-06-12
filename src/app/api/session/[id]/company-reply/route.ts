import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import { analyzeCompanyReply, generateCounterReply } from "@/lib/ai";
import { buildCompanyReplyAnalysisPrompt, buildCounterReplyPrompt } from "@/lib/prompts";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { reply } = await request.json().catch(() => ({ reply: "" }));

  const analysisPrompt = buildCompanyReplyAnalysisPrompt(
    session.messages.find((m) => m.role === "assistant")?.content || "",
    reply,
    session.extractedData
  );

  const analysis = await analyzeCompanyReply(analysisPrompt);

  const counterPrompt = buildCounterReplyPrompt(
    session.messages.find((m) => m.role === "assistant")?.content || "",
    reply,
    analysis
  );

  const counterReply = await generateCounterReply(counterPrompt);

  return NextResponse.json({
    sessionId: id,
    analysis,
    weaknesses: ["Puntos débiles identificados en el análisis anterior."],
    recommendation: "Revisa el análisis detallado y envía la contrarespuesta.",
    counterReply,
  });
}
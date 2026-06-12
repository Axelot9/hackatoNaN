import { NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import { generateCounterReply } from "@/lib/ai";
import { buildCounterReplyPrompt } from "@/lib/prompts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const claimText = session.messages.find((m) => m.role === "assistant")?.content || "";
  const companyResponse = session.companyResponse?.originalText || "";
  const analysis = session.companyResponse?.analysis || "";

  const prompt = buildCounterReplyPrompt(claimText, companyResponse, analysis);
  const counterReply = await generateCounterReply(prompt);

  return NextResponse.json({
    sessionId: id,
    counterReply,
    legalBasis: "Fundamento legal basado en el análisis previo.",
  });
}

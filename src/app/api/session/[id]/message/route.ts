import { NextRequest } from "next/server";
import { getSession, updateSession } from "@/lib/sessions";
import { generateFirstResponse, generateNextQuestion } from "@/lib/ai";
import { calculateScore, updateChecklist } from "@/lib/scoring";
import { claimTypeLabels } from "@/lib/prompts";
import { ClaimType } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { message } = await request.json();

  const session = getSession(id);
  if (!session) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Save user message
  const userMsg = {
    role: "user" as const,
    content: message,
    timestamp: new Date().toISOString(),
  };
  const messages = [...session.messages, userMsg];

  // Detect claim type and generate response
  let stream: ReadableStream<string>;
  let claimType = session.claimType;
  let claimTypeLabel = session.claimTypeLabel;

  if (!claimType) {
    const result = await generateFirstResponse(message);
    stream = result.stream;
    claimType = result.claimType;
    claimTypeLabel = claimTypeLabels[claimType] || "Otro";
  } else {
    const previousQuestions = messages
      .filter((m) => m.role === "assistant")
      .map((m) => m.content);
    const result = await generateNextQuestion(
      claimType,
      session.extractedData,
      previousQuestions,
      session.score.total
    );
    stream = result.stream;
  }

  // Extract simple data from message (mock heuristic)
  const extractedData = { ...session.extractedData };
  if (message.length > 10) {
    extractedData.problema = message;
  }
  if (message.match(/\d{4}-\d{2}-\d{2}/)) {
    extractedData.fechaEntrega = message.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  }
  if (message.match(/\d+[.,]?\d*\s*€/)) {
    extractedData.importe = message.match(/\d+[.,]?\d*/)?.[0];
  }
  if (message.toLowerCase().includes("amazon") || message.toLowerCase().includes("tienda")) {
    extractedData.empresaImplicada = "Amazon";
  }

  // Recalculate score
  const score = calculateScore(claimType, extractedData, session.evidence);
  const checklist = updateChecklist(session.checklist, score);

  // We need to capture the streamed text to save it
  const reader = stream.getReader();
  let assistantText = "";
  const capturedStream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += value;
        controller.enqueue(value);
      }

      // Save assistant message and updated session after stream completes
      const assistantMsg = {
        role: "assistant" as const,
        content: assistantText,
        timestamp: new Date().toISOString(),
      };

      updateSession(id, {
        messages: [...messages, assistantMsg],
        claimType,
        claimTypeLabel,
        extractedData,
        score,
        checklist,
      });

      controller.close();
    },
  });

  return new Response(capturedStream as unknown as ReadableStream<Uint8Array>, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}

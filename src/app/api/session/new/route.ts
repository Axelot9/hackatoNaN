import { NextResponse } from "next/server";
import { createSession, updateSession } from "@/lib/sessions";

export async function POST() {
  const session = createSession();
  const firstMessage =
    "Hola, soy AutoclAIm. Cuéntame qué ha pasado y te ayudo a construir un caso sólido.";

  updateSession(session.id, {
    messages: [
      {
        role: "assistant",
        content: firstMessage,
        timestamp: new Date().toISOString(),
      },
    ],
  });

  return NextResponse.json({
    sessionId: session.id,
    firstMessage,
  });
}

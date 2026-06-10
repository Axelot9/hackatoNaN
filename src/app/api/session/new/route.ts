import { NextResponse } from "next/server";
import { createSession } from "@/lib/sessions";

export async function POST() {
  const session = createSession();
  const firstMessage =
    "Hola, soy AutoclAIm. Cuéntame qué ha pasado y te ayudo a construir un caso sólido.";

  return NextResponse.json({
    sessionId: session.id,
    firstMessage,
  });
}

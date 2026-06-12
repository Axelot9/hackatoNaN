import { ClaimType } from "@/types";
import { streamChat, chatCompletion, chatCompletionWithImage } from "./openai";
import { getOpenAIConfig, hasOpenAIKey } from "./openai-config";
import {
  buildDetectionPrompt,
  buildNextQuestionPrompt,
  buildImageAnalysisPrompt,
} from "./prompts";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockStream(text: string): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      for (const char of text) {
        controller.enqueue(char);
        await sleep(15);
      }
      controller.close();
    },
  });
}

export function detectClaimType(message: string): ClaimType {
  const lower = message.toLowerCase();
  if (lower.includes("cafetera") || lower.includes("rota") || lower.includes("dañado") || lower.includes("golpe")) {
    return "damaged_product";
  }
  if (lower.includes("defectuoso") || lower.includes("no funciona") || lower.includes("falla")) {
    return "defective_product";
  }
  if (lower.includes("hotel") || lower.includes("habitación") || lower.includes("sucia") || lower.includes("cucaracha")) {
    return "bad_hotel";
  }
  if (lower.includes("maleta") || lower.includes("equipaje") || lower.includes("vuelo")) {
    return "damaged_luggage";
  }
  if (lower.includes("reparación") || lower.includes("taller")) {
    return "bad_repair";
  }
  if (lower.includes("banco") || lower.includes("cargo") || lower.includes("cobro")) {
    return "bank_charge";
  }
  if (lower.includes("seguro")) {
    return "insurance";
  }
  if (lower.includes("alquiler") || lower.includes("piso") || lower.includes("vivienda")) {
    return "rental";
  }
  return "other";
}

export async function generateFirstResponse(userMessage: string) {
  const claimType = detectClaimType(userMessage);
  const hasKey = hasOpenAIKey();

  if (!hasKey) {
    const fallback: Record<ClaimType, string> = {
      damaged_product:
        "Entendido, parece que recibiste un producto dañado. Voy a ayudarte a construir un caso sólido paso a paso. ¿Tienes una foto del producto tal como llegó? Esto será clave como prueba.",
      defective_product:
        "Parece que tienes un producto defectuoso. ¿Tienes la factura y fotos del defecto?",
      bad_hotel:
        "Veo que tuviste un problema en un hotel. Te ayudaré a documentarlo correctamente. ¿Tienes fotos de la habitación o los problemas que encontraste?",
      damaged_luggage:
        "Parece que tu equipaje sufrió daños durante un vuelo. Te guiaré para reclamar. ¿Tienes foto de la maleta dañada y la etiqueta de equipaje?",
      bad_repair:
        "Entiendo que una reparación no salió bien. Vamos a documentarlo. ¿Tienes fotos del resultado y el presupuesto original?",
      bank_charge:
        "Detecto un posible cargo bancario indebido. Te ayudaré a reclamar. ¿Tienes captura del cargo en tu cuenta?",
      insurance:
        "Parece que tienes un problema con un seguro. ¿Qué tipo de seguro es y qué ocurrió exactamente?",
      rental:
        "Entiendo que hay un problema con un alquiler. ¿Tienes el contrato y fotos del estado actual?",
      other:
        "Gracias por compartir tu problema. Cuéntame más detalles para poder clasificarlo y ayudarte mejor. ¿Tienes alguna evidencia documental?",
    };
    return { stream: mockStream(fallback[claimType] || fallback.other), claimType };
  }

  const prompt = buildDetectionPrompt(userMessage);
  const stream = await streamChat([
    { role: "system", content: "Eres AutoclAIm, un asistente legal especializado en reclamaciones de consumo en español." },
    { role: "user", content: prompt },
  ]);

  return { stream, claimType };
}

export async function generateNextQuestion(
  claimType: ClaimType,
  extractedData: Record<string, string | boolean | number | undefined>,
  previousQuestions: string[],
  score: number
) {
  const hasKey = hasOpenAIKey();

  if (!hasKey) {
    const questions: Record<string, string[]> = {
      damaged_product: [
        "¿Tienes foto del embalaje/caja tal como llegó?",
        "¿Tienes la factura o captura del pedido?",
        "¿Cuándo llegó el paquete exactamente?",
        "¿Cuál es el importe del producto?",
        "¿Ya contactaste con la tienda? ¿Qué te dijeron?",
        "¿Puedes describir con más detalle el daño que observas?",
        "¿Tienes tus datos personales completos (nombre, dirección, email)?",
      ],
      bad_hotel: [
        "¿Cuándo fue tu estancia exactamente?",
        "¿Tienes la reserva o confirmación del hotel?",
        "¿Qué precio pagaste en total?",
        "¿Comunicaste el problema en recepción? ¿Qué te dijeron?",
        "¿Buscaste una alternativa de alojamiento?",
        "¿Tienes fotos de los problemas (suciedad, averías, etc.)?",
        "¿Cuál es el nombre exacto del hotel?",
      ],
      damaged_luggage: [
        "¿En qué vuelo viajaste exactamente (número y fecha)?",
        "¿Tienes la etiqueta de equipaje (bag tag)?",
        "¿Presentaste parte en el aeropuerto (PIR)?",
        "¿Tienes el billete de avión o la tarjeta de embarque?",
        "¿Cuál es el importe aproximado de la maleta?",
        "¿Tienes foto del daño detalladamente?",
        "¿Qué aerolínea era?",
      ],
      other: [
        "¿Puedes darme más detalles sobre lo ocurrido?",
        "¿Tienes alguna evidencia documental o fotográfica?",
        "¿Cuándo ocurrió exactamente?",
        "¿Hay alguna empresa o entidad implicada?",
      ],
    };
    const pool = questions[claimType] || questions.other;
    const next = pool.find((q) => !previousQuestions.includes(q)) || pool[pool.length - 1];
    return { stream: mockStream(next + " Esto nos ayudará a reforzar tu caso.") };
  }

  const prompt = buildNextQuestionPrompt(claimType, extractedData, previousQuestions, score);
  const stream = await streamChat([
    { role: "system", content: "Eres AutoclAIm, un asistente legal especializado en reclamaciones de consumo en español." },
    { role: "user", content: prompt },
  ]);

  return { stream };
}

export async function analyzeImage(base64: string, mimeType: string): Promise<string> {
  const hasKey = hasOpenAIKey();
  if (!hasKey) {
    return "Se observa un golpe visible en la esquina superior derecha. El daño parece reciente y coincide con un impacto durante el transporte. La imagen es útil como prueba.";
  }

  const prompt = buildImageAnalysisPrompt();
  return chatCompletionWithImage(prompt, base64, mimeType);
}

export async function generateClaim(prompt: string): Promise<string> {
  const hasKey = hasOpenAIKey();
  if (!hasKey) {
    return "RECLAMACIÓN FORMAL — stub: no hay API key configurada.";
  }
  return chatCompletion([
    { role: "system", content: "Eres un experto en redacción de reclamaciones formales en español." },
    { role: "user", content: prompt },
  ]);
}

export async function analyzeCompanyReply(prompt: string): Promise<string> {
  const hasKey = hasOpenAIKey();
  if (!hasKey) {
    return "Análisis de puntos débiles — stub: no hay API key configurada.";
  }
  return chatCompletion([
    { role: "system", content: "Eres un analista legal experto en reclamaciones de consumo." },
    { role: "user", content: prompt },
  ]);
}

export async function generateCounterReply(prompt: string): Promise<string> {
  const hasKey = hasOpenAIKey();
  if (!hasKey) {
    return "Contrarespuesta firme — stub: no hay API key configurada.";
  }
  return chatCompletion([
    { role: "system", content: "Eres un experto en contestar a rechazos de empresas." },
    { role: "user", content: prompt },
  ]);
}
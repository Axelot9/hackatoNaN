import { convertToModelMessages, streamText } from "ai";
import { buildDetectionPrompt, buildNextQuestionPrompt } from "./prompts";
import { ClaimType } from "@/types";

// Placeholder: mock AI provider. Wire real keys in .env.local later.
const MOCK_PROVIDER = {
  async *stream({ prompt }: { prompt: string }) {
    const words = prompt.split(" ");
    for (const word of words.slice(0, 30)) {
      yield word + " ";
      await sleep(30);
    }
  },
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function detectClaimType(message: string): ClaimType {
  const lower = message.toLowerCase();
  if (lower.includes("cafetera") || lower.includes("rota") || lower.includes("dañado") || lower.includes("golpe")) {
    return "damaged_product";
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
  const prompt = buildDetectionPrompt(userMessage);

  // Mock streaming via ai SDK compatible stream
  const stream = new ReadableStream({
    async start(controller) {
      const responses: Record<ClaimType, string> = {
        damaged_product:
          "Entendido, parece que recibiste un producto dañado. Voy a ayudarte a construir un caso sólido paso a paso. ¿Tienes una foto del producto tal como llegó? Esto será clave como prueba.",
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
        defective_product:
          "Parece que tienes un producto defectuoso. ¿Tienes la factura y fotos del defecto?",
      };

      const text = responses[claimType] || responses.other;
      for (const char of text) {
        controller.enqueue(char);
        await sleep(15);
      }
      controller.close();
    },
  });

  return { stream, claimType };
}

export async function generateNextQuestion(
  claimType: ClaimType,
  extractedData: Record<string, string | boolean | number | undefined>,
  previousQuestions: string[],
  score: number
) {
  const prompt = buildNextQuestionPrompt(claimType, extractedData, previousQuestions, score);

  const stream = new ReadableStream({
    async start(controller) {
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
      const text = next + " Esto nos ayudará a reforzar tu caso.";

      for (const char of text) {
        controller.enqueue(char);
        await sleep(15);
      }
      controller.close();
    },
  });

  return { stream, prompt };
}

export async function analyzeImageMock(): Promise<string> {
  await sleep(500);
  return "Se observa un golpe visible en la esquina superior derecha. El daño parece reciente y coincide con un impacto durante el transporte. La imagen es útil como prueba.";
}

import { ClaimType, ExtractedData, Evidence } from "@/types";

export function buildDetectionPrompt(userMessage: string): string {
  return `Eres AutoclAIm, una IA especializada en ayudar a personas a construir casos de reclamación sólidos.

El usuario te acaba de describir su problema por primera vez.

Tu trabajo:
1. Detecta el tipo de reclamación (damaged_product, defective_product, damaged_luggage, bad_hotel, bad_repair, bank_charge, insurance, rental, other)
2. Responde con empatía y profesionalidad
3. Explica qué vas a hacer (guiarle paso a paso)
4. Haz UNA primera pregunta concreta y fácil de responder
5. Menciona brevemente por qué esa información es importante

Tipo de reclamación detectada: [CLAIM_TYPE]
Problema descrito: ${userMessage}

Responde en máximo 3-4 frases. Sé directo y cercano.`;
}

export function buildNextQuestionPrompt(
  claimType: ClaimType,
  extractedData: ExtractedData,
  previousQuestions: string[],
  score: number
): string {
  return `Eres AutoclAIm. Estás en una conversación de recolección de datos para una reclamación.

Tipo de reclamación: ${claimType}
Datos recogidos hasta ahora: ${JSON.stringify(extractedData)}
Preguntas ya hechas: ${JSON.stringify(previousQuestions)}
Score actual: ${score}

Tu trabajo:
1. Analiza qué datos faltan para construir un caso sólido
2. Haz UNA pregunta concreta sobre el dato más importante que falta
3. Explica brevemente por qué necesitas ese dato
4. Si ya tienes suficiente información (score >= 75), indica que puedes generar el expediente

Reglas:
- Nunca repitas preguntas ya hechas
- Prioriza: fotos/evidencia > fechas > números de pedido > importes > otros
- Sé conciso: máximo 2-3 frases
- Si el usuario dio información vaga, pide concreción
- Adapta el lenguaje al tipo de reclamación`;
}

export function buildScorePrompt(
  claimType: ClaimType,
  extractedData: ExtractedData,
  evidence: Evidence[]
): string {
  return `Eres un sistema de scoring de expedientes de reclamación.

Tipo de reclamación: ${claimType}
Datos recogidos: ${JSON.stringify(extractedData)}
Evidencias: ${JSON.stringify(evidence.map((e) => ({ type: e.type, description: e.description })))}

Calcula un score del 0 al 100 basado en estos factores (suman 100):
- Problema bien explicado: 15 puntos
- Foto del producto/daño: 15 puntos
- Foto del embalaje/entorno: 10 puntos
- Factura o número de pedido: 12 puntos
- Fecha exacta de compra/entrega/estancia: 8 puntos
- Descripción detallada del daño/problema: 10 puntos
- Comunicación previa con la empresa: 8 puntos
- Datos personales completos: 5 puntos
- Empresa/destinatario identificado: 7 puntos
- Testimonios o pruebas adicionales: 10 puntos

IMPORTANTE: Adapta los factores al tipo de reclamación.

Devuelve JSON con:
{
  "total": number,
  "breakdown": { "factor": points, ... },
  "missingCritical": ["factor que falta y es crítico"],
  "suggestion": "Qué subiría más el score"
}`;
}

export function buildImageAnalysisPrompt(): string {
  return `Eres un analista de evidencia visual para reclamaciones.

Analiza esta imagen y describe:
1. ¿Qué se ve en la imagen?
2. ¿Hay daños visibles? Descríbelos con detalle.
3. ¿El daño parece reciente o antiguo?
4. ¿Hay elementos que ayuden a identificar el producto, embalaje o contexto?
5. ¿La imagen es útil como prueba para una reclamación?

Sé objetivo y descriptivo. No inventes información que no esté visible.`;
}

export function buildClaimGenerationPrompt(
  claimType: ClaimType,
  problemDescription: string,
  extractedData: ExtractedData,
  evidence: Evidence[],
  timeline: { date: string; event: string; source: string }[]
): string {
  return `Eres un experto en redacción de reclamaciones formales en español.

Datos del caso:
- Tipo: ${claimType}
- Problema: ${problemDescription}
- Datos extraídos: ${JSON.stringify(extractedData)}
- Evidencias: ${JSON.stringify(evidence.map((e) => e.description))}
- Cronología: ${JSON.stringify(timeline)}

Genera una reclamación formal que incluya:
1. Encabezado con datos del reclamante
2. Descripción clara del problema
3. Cronología de hechos
4. Base legal (general: derecho de consumidor, garantía legal)
5. Reclamación concreta (reembolso, sustitución, reparación)
6. Plazo de respuesta razonable (15 días)
7. Aviso de escalada (consumo, tribunales)

Tono: firme pero profesional. Sin amenazas, pero con determinación.
Extensión: 1-2 páginas.`;
}

export function buildCompanyReplyAnalysisPrompt(
  claimGenerated: string,
  companyResponse: string,
  extractedData: ExtractedData
): string {
  return `Eres AutoclAIm analizando la respuesta negativa de una empresa a una reclamación.

Nuestra reclamación original:
${claimGenerated}

Respuesta de la empresa:
${companyResponse}

Datos del caso:
${JSON.stringify(extractedData)}

Analiza:
1. Qué argumentos usa la empresa para rechazar
2. Puntos débiles de su respuesta
3. Qué argumentos legales podemos usar contra ellos
4. Si mencionan plazos o condiciones que podemos cuestionar
5. Recomendación de siguiente acción concreta

Sé analítico y preciso. Identifica cada punto débil con su contraargumento.`;
}

export function buildCounterReplyPrompt(
  claimGenerated: string,
  companyResponse: string,
  analysis: string
): string {
  return `Eres un experto en contestar a rechazos de empresas.

Reclamación original: ${claimGenerated}
Respuesta negativa: ${companyResponse}
Análisis de puntos débiles: ${analysis}

Genera una contrarespuesta firme que:
1. Rebuta punto por punto los argumentos de la empresa
2. Cite la base legal correspondiente
3. Reafirme la reclamación
4. Establezca un nuevo plazo razonable
5. Indique las próximas escaladas si no hay respuesta satisfactoria

Tono: respetuoso pero inequívocamente firme.
Extensión: 1 página.`;
}

export const claimTypeLabels: Record<string, string> = {
  damaged_product: "Producto recibido dañado",
  defective_product: "Producto defectuoso",
  damaged_luggage: "Maleta dañada",
  bad_hotel: "Hotel en mal estado",
  bad_repair: "Reparación mal hecha",
  bank_charge: "Cargo bancario extraño",
  insurance: "Seguro",
  rental: "Alquiler/vivienda",
  other: "Otro",
};

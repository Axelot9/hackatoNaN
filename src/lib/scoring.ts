import { ClaimType, Score, ChecklistItem, ExtractedData, Evidence } from "@/types";
import { getInitialChecklist } from "./sessions";

export function calculateScore(
  claimType: ClaimType | null,
  extractedData: ExtractedData,
  evidence: Evidence[]
): Score {
  if (!claimType) {
    return {
      total: 0,
      breakdown: {},
      missingCritical: ["problemaExplicado"],
      suggestion: "Describe tu problema para empezar.",
    };
  }

  const checklist = getInitialChecklist(claimType);
  const breakdown: Record<string, number> = {};
  let total = 0;
  const missingCritical: string[] = [];

  for (const item of checklist) {
    let points = 0;
    const key = item.key;

    if (key === "problemaExplicado") {
      if (extractedData.problema && String(extractedData.problema).length > 10) {
        points = item.weight;
      } else {
        missingCritical.push(key);
      }
    } else if (key === "fotoProducto" || key === "fotosDelProblema") {
      const hasImage = evidence.some((e) => e.type === "image" && e.description);
      if (hasImage) {
        points = item.weight;
      } else {
        missingCritical.push(key);
      }
    } else if (key === "fotoEmbalaje") {
      const hasPackaging = evidence.some(
        (e) =>
          e.type === "image" &&
          (e.description.toLowerCase().includes("caja") ||
            e.description.toLowerCase().includes("embalaje"))
      );
      if (hasPackaging) {
        points = item.weight;
      }
    } else if (key === "facturaPedido" || key === "reservaConfirmacion" || key === "etiquetaEquipaje") {
      if (
        extractedData.numeroPedido ||
        extractedData.factura ||
        extractedData.reserva ||
        extractedData.etiqueta
      ) {
        points = item.weight;
      } else {
        missingCritical.push(key);
      }
    } else if (key === "fechaEntrega" || key === "fechaEstancia" || key === "fechaVuelo") {
      if (extractedData.fechaEntrega || extractedData.fechaEstancia || extractedData.fechaVuelo) {
        points = item.weight;
      }
    } else if (key === "descripcionDetallada" || key === "precioPagado" || key === "billeteAvion") {
      if (
        extractedData.descripcionDanio ||
        extractedData.importe ||
        extractedData.precio ||
        extractedData.billete
      ) {
        points = item.weight;
      }
    } else if (key === "comunicacionPrevia" || key === "comunicacionRecepcion" || key === "parteAeropuerto") {
      if (
        extractedData.comunicacionPrevia ||
        extractedData.comunicacionRecepcion ||
        extractedData.parteAeropuerto
      ) {
        points = item.weight;
      }
    } else if (key === "datosPersonales") {
      if (extractedData.nombre && extractedData.email) {
        points = item.weight;
      }
    } else if (key === "empresaIdentificada" || key === "hotelIdentificado" || key === "aerolineaIdentificada") {
      if (extractedData.empresaImplicada || extractedData.hotel || extractedData.aerolinea) {
        points = item.weight;
      }
    } else if (key === "pruebasAdicionales" || key === "testimonios") {
      if (evidence.length > 1) {
        points = item.weight;
      }
    } else if (key === "respuestaHotel") {
      if (extractedData.respuestaHotel) {
        points = item.weight;
      }
    } else if (key === "alternativaAlojamiento") {
      if (extractedData.alternativaAlojamiento) {
        points = item.weight;
      }
    } else if (key === "importeMaleta") {
      if (extractedData.importeMaleta) {
        points = item.weight;
      }
    }

    breakdown[key] = points;
    total += points;
  }

  const suggestion = missingCritical.length > 0
    ? `Subiría más el score: ${missingCritical[0]}`
    : "Caso sólido. Puedes generar el expediente.";

  return {
    total,
    breakdown,
    missingCritical,
    suggestion,
  };
}

export function updateChecklist(
  checklist: ChecklistItem[],
  score: Score
): ChecklistItem[] {
  return checklist.map((item) => ({
    ...item,
    done: score.breakdown[item.key] ? score.breakdown[item.key] > 0 : false,
  }));
}

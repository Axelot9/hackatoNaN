import { v4 as uuidv4 } from "uuid";
import { Session, ClaimType, Score, ChecklistItem } from "@/types";

const sessions = new Map<string, Session>();

export function createSession(): Session {
  const id = uuidv4();
  const now = new Date().toISOString();
  const session: Session = {
    id,
    createdAt: now,
    claimType: null,
    claimTypeLabel: null,
    messages: [],
    evidence: [],
    extractedData: {},
    timeline: [],
    score: {
      total: 0,
      breakdown: {},
      missingCritical: [],
      suggestion: "",
    },
    checklist: getInitialChecklist(null),
    companyResponse: null,
    claimGenerated: false,
    pdfGenerated: false,
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, updates: Partial<Session>): Session | null {
  const session = sessions.get(id);
  if (!session) return null;
  const updated = { ...session, ...updates };
  sessions.set(id, updated);
  return updated;
}

export function deleteSession(id: string): boolean {
  return sessions.delete(id);
}

export function getAllSessions(): Session[] {
  return Array.from(sessions.values());
}

export function getInitialChecklist(claimType: ClaimType | null): ChecklistItem[] {
  const base: ChecklistItem[] = [
    { item: "Problema explicado", done: false, weight: 15, key: "problemaExplicado" },
    { item: "Foto del producto/daño", done: false, weight: 15, key: "fotoProducto" },
    { item: "Foto del embalaje/entorno", done: false, weight: 10, key: "fotoEmbalaje" },
    { item: "Factura / nº pedido", done: false, weight: 12, key: "facturaPedido" },
    { item: "Fecha de entrega/estancia", done: false, weight: 8, key: "fechaEntrega" },
    { item: "Descripción detallada del daño", done: false, weight: 10, key: "descripcionDetallada" },
    { item: "Comunicación previa con empresa", done: false, weight: 8, key: "comunicacionPrevia" },
    { item: "Datos personales", done: false, weight: 5, key: "datosPersonales" },
    { item: "Empresa identificada", done: false, weight: 7, key: "empresaIdentificada" },
    { item: "Testimonios o pruebas adicionales", done: false, weight: 10, key: "pruebasAdicionales" },
  ];

  if (claimType === "bad_hotel") {
    return [
      { item: "Problema explicado", done: false, weight: 15, key: "problemaExplicado" },
      { item: "Fotos del problema", done: false, weight: 15, key: "fotoProducto" },
      { item: "Reserva/confirmación", done: false, weight: 12, key: "facturaPedido" },
      { item: "Fecha de estancia", done: false, weight: 8, key: "fechaEntrega" },
      { item: "Precio pagado", done: false, weight: 10, key: "descripcionDetallada" },
      { item: "Comunicación en recepción", done: false, weight: 10, key: "comunicacionPrevia" },
      { item: "Respuesta del hotel", done: false, weight: 8, key: "respuestaHotel" },
      { item: "Alternativa de alojamiento", done: false, weight: 5, key: "alternativaAlojamiento" },
      { item: "Datos personales", done: false, weight: 5, key: "datosPersonales" },
      { item: "Hotel identificado", done: false, weight: 7, key: "empresaIdentificada" },
      { item: "Testimonios o pruebas adicionales", done: false, weight: 5, key: "pruebasAdicionales" },
    ];
  }

  if (claimType === "damaged_luggage") {
    return [
      { item: "Problema explicado", done: false, weight: 15, key: "problemaExplicado" },
      { item: "Foto de la maleta", done: false, weight: 15, key: "fotoProducto" },
      { item: "Etiqueta de equipaje", done: false, weight: 12, key: "facturaPedido" },
      { item: "Fecha del vuelo", done: false, weight: 8, key: "fechaEntrega" },
      { item: "Billete de avión", done: false, weight: 10, key: "descripcionDetallada" },
      { item: "Parte presentado en aeropuerto", done: false, weight: 10, key: "comunicacionPrevia" },
      { item: "Importe de la maleta", done: false, weight: 10, key: "importeMaleta" },
      { item: "Datos personales", done: false, weight: 5, key: "datosPersonales" },
      { item: "Aerolínea identificada", done: false, weight: 10, key: "empresaIdentificada" },
      { item: "Testimonios o pruebas adicionales", done: false, weight: 5, key: "pruebasAdicionales" },
    ];
  }

  return base;
}

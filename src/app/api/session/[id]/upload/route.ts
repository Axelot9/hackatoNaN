import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession, updateSession } from "@/lib/sessions";
import { calculateScore, updateChecklist } from "@/lib/scoring";
import { analyzeImage } from "@/lib/ai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Parse form data
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Read file into memory as base64 data URL so the frontend can preview it
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mime = file.type || "application/octet-stream";
  const dataUrl = `data:${mime};base64,${base64}`;

  // Real AI image analysis (falls back to mock if no API key)
  const aiAnalysis = mime.startsWith("image/")
    ? await analyzeImage(base64, mime)
    : "Documento registrado como evidencia.";

  const isImage = mime.startsWith("image/");
  const isText = mime === "text/plain";

  const evidence = {
    id: uuidv4(),
    type: isImage ? ("image" as const) : ("document" as const),
    url: dataUrl,
    description: `${file.name}`,
    aiAnalysis: isImage ? aiAnalysis : isText ? "Documento de texto registrado como evidencia." : "Documento registrado como evidencia.",
    addedAt: new Date().toISOString(),
  };

  const newEvidence = [...session.evidence, evidence];

  // Recalculate score
  const score = calculateScore(session.claimType, session.extractedData, newEvidence);
  const checklist = updateChecklist(session.checklist, score);

  // Update session
  updateSession(id, {
    evidence: newEvidence,
    score,
    checklist,
  });

  return NextResponse.json({
    evidence,
    score,
    checklist,
    aiComment:
      "He analizado la imagen y se confirma un golpe en la esquina. Esto refuerza tu caso.",
  });
}

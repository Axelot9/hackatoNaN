import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession, updateSession } from "@/lib/sessions";
import { calculateScore, updateChecklist } from "@/lib/scoring";
import { analyzeImageMock } from "@/lib/ai";

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

  // Mock upload: generate a fake URL instead of Supabase Storage
  const mockUrl = `https://storage.autoclaim.dev/evidence/${id}/${file.name}`;

  // Mock MiMo 2.5 analysis
  const aiAnalysis = await analyzeImageMock();

  const evidence = {
    id: uuidv4(),
    type: file.type.startsWith("image/") ? ("image" as const) : ("document" as const),
    url: mockUrl,
    description: `Archivo subido: ${file.name}`,
    aiAnalysis,
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

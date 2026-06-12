import { Evidence, Score, ChecklistItem, CompanyResponse } from "@/types";

const BASE = typeof window !== "undefined" ? "" : "http://localhost:3000";

export interface SessionState {
  sessionId: string;
  claimType: string | null;
  claimTypeLabel: string | null;
  score: Score;
  checklist: ChecklistItem[];
  extractedData: Record<string, string | boolean | number | undefined>;
  evidence: Evidence[];
  timeline: { date: string; event: string; source: string }[];
  companyResponse: CompanyResponse | null;
  claimGenerated: boolean;
}

export interface CreateSessionResponse {
  sessionId: string;
  firstMessage: string;
}

export interface UploadResponse {
  evidence: Evidence;
  score: Score;
  checklist: ChecklistItem[];
  aiComment: string;
}

export interface GenerateResponse {
  sessionId: string;
  claim: string;
  summary: string;
  timeline: { date: string; event: string; source: string }[];
  nextSteps: string[];
  checklist: string;
}

export interface CompanyReplyResponse {
  sessionId: string;
  analysis: string;
  weaknesses: string[];
  recommendation: string;
  counterReply: string;
}

export interface CounterResponse {
  sessionId: string;
  counterReply: string;
  legalBasis: string;
}

export async function createSession(): Promise<CreateSessionResponse> {
  const res = await fetch(`${BASE}/api/session/new`, { method: "POST" });
  if (!res.ok) throw new Error(`Error creating session: ${res.status}`);
  return res.json();
}

export async function sendMessage(
  sessionId: string,
  message: string,
  onChunk: (text: string) => void
): Promise<void> {
  const res = await fetch(`${BASE}/api/session/${sessionId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Error sending message: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export async function getSessionState(sessionId: string): Promise<SessionState> {
  const res = await fetch(`${BASE}/api/session/${sessionId}/state`);
  if (!res.ok) throw new Error(`Error fetching state: ${res.status}`);
  return res.json();
}

export async function uploadEvidence(
  sessionId: string,
  file: File
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE}/api/session/${sessionId}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Error uploading file: ${res.status}`);
  return res.json();
}

export async function generateClaim(sessionId: string): Promise<GenerateResponse> {
  const res = await fetch(`${BASE}/api/session/${sessionId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error(`Error generating claim: ${res.status}`);
  return res.json();
}

export async function analyzeCompanyReply(
  sessionId: string,
  reply: string
): Promise<CompanyReplyResponse> {
  const res = await fetch(`${BASE}/api/session/${sessionId}/company-reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reply }),
  });

  if (!res.ok) throw new Error(`Error analyzing reply: ${res.status}`);
  return res.json();
}

export async function generateCounterReply(
  sessionId: string
): Promise<CounterResponse> {
  const res = await fetch(`${BASE}/api/session/${sessionId}/counter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error(`Error generating counter: ${res.status}`);
  return res.json();
}
export type ClaimType =
  | "damaged_product"
  | "defective_product"
  | "damaged_luggage"
  | "bad_hotel"
  | "bad_repair"
  | "bank_charge"
  | "insurance"
  | "rental"
  | "other";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Evidence {
  id: string;
  type: "image" | "document" | "text";
  url: string;
  description: string;
  aiAnalysis: string;
  addedAt: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  source: string;
}

export interface ScoreBreakdown {
  [factor: string]: number;
}

export interface Score {
  total: number;
  breakdown: ScoreBreakdown;
  missingCritical: string[];
  suggestion: string;
}

export interface ChecklistItem {
  item: string;
  done: boolean;
  weight: number;
  key: string;
}

export interface ExtractedData {
  [key: string]: string | boolean | number | undefined;
}

export interface CompanyResponse {
  originalText: string;
  analyzedAt: string;
  analysis: string;
  weaknesses: string[];
  recommendation: string;
  counterReply: string;
}

export interface Session {
  id: string;
  createdAt: string;
  claimType: ClaimType | null;
  claimTypeLabel: string | null;
  messages: Message[];
  evidence: Evidence[];
  extractedData: ExtractedData;
  timeline: TimelineEvent[];
  score: Score;
  checklist: ChecklistItem[];
  companyResponse: CompanyResponse | null;
  claimGenerated: boolean;
  pdfGenerated: boolean;
}

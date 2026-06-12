"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Message,
  Score,
  ChecklistItem,
  Evidence,
  CompanyResponse,
  TimelineEvent,
} from "@/types";
import {
  createSession,
  sendMessage,
  uploadEvidence,
  getSessionState,
  generateClaim,
  analyzeCompanyReply,
  generateCounterReply,
} from "@/lib/api";
import NotebookLayout from "@/components/NotebookLayout";
import DocumentosPanel from "@/components/DocumentosPanel";
import ResponsePanel from "@/components/ResponsePanel";
import Sidebar from "@/components/Sidebar";
import ClaimView from "@/components/ClaimView";
import CompanyReply from "@/components/CompanyReply";

const defaultScore: Score = {
  total: 0,
  breakdown: {},
  missingCritical: [],
  suggestion: "Describe tu problema para empezar.",
};

const defaultChecklist: ChecklistItem[] = [];

const tabs = ["chat", "expediente", "respuesta"] as const;
type Tab = (typeof tabs)[number];

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [score, setScore] = useState<Score>(defaultScore);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [claimTypeLabel, setClaimTypeLabel] = useState<string | null>(null);
  const [claimGenerated, setClaimGenerated] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamText, setCurrentStreamText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [generatedClaim, setGeneratedClaim] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [generatedTimeline, setGeneratedTimeline] = useState<
    { date: string; event: string; source: string }[]
  >([]);
  const [generatedNextSteps, setGeneratedNextSteps] = useState<string[]>([]);

  const [companyAnalysis, setCompanyAnalysis] =
    useState<CompanyResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingCounter, setIsGeneratingCounter] = useState(false);
  const [counterReplyText, setCounterReplyText] = useState<string | null>(null);

  const [isPdfReady, setIsPdfReady] = useState(false);

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploadQueue = useRef<File[]>([]);
  const isProcessingUpload = useRef(false);

  const pollState = useCallback(async (id: string) => {
    try {
      const state = await getSessionState(id);
      setScore(state.score);
      setChecklist(state.checklist);
      setEvidence(state.evidence);
      setClaimTypeLabel(state.claimTypeLabel);
      setClaimGenerated(state.claimGenerated);
    } catch {
      // Silently fail on poll — will retry
    }
  }, []);

  useEffect(() => {
    createSession()
      .then((data) => {
        setSessionId(data.sessionId);
        setMessages([
          {
            role: "assistant",
            content: data.firstMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (sessionId) {
      pollTimer.current = setInterval(() => pollState(sessionId), 3000);
      return () => {
        if (pollTimer.current) clearInterval(pollTimer.current);
      };
    }
  }, [sessionId, pollState]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!sessionId || isStreaming) return;

      const userMsg: Message = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setCurrentStreamText("");
      setError(null);

      try {
        let fullText = "";
        await sendMessage(sessionId, message, (chunk) => {
          fullText += chunk;
          setCurrentStreamText(fullText);
        });
        const assistantMsg: Message = {
          role: "assistant",
          content: fullText,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setCurrentStreamText("");
        await pollState(sessionId);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, isStreaming, pollState]
  );

  const processUploadQueue = useCallback(async () => {
    if (!sessionId || isProcessingUpload.current) return;
    isProcessingUpload.current = true;
    setIsUploading(true);
    setError(null);

    while (uploadQueue.current.length > 0) {
      const file = uploadQueue.current.shift()!;
      try {
        const result = await uploadEvidence(sessionId, file);
        setEvidence((prev) => [...prev, result.evidence]);
        setScore(result.score);
        setChecklist(result.checklist);

        const assistantMsg: Message = {
          role: "assistant",
          content: result.aiComment,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        setError(err.message);
        break;
      }
    }

    setIsUploading(false);
    isProcessingUpload.current = false;
  }, [sessionId]);

  const handleUploadFile = useCallback(
    (file: File) => {
      uploadQueue.current.push(file);
      processUploadQueue();
    },
    [processUploadQueue]
  );

  const handleDeleteEvidence = useCallback((id: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleGenerateClaim = useCallback(async () => {
    if (!sessionId || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateClaim(sessionId);
      setGeneratedClaim(result.claim);
      setGeneratedSummary(result.summary);
      setGeneratedTimeline(result.timeline);
      setGeneratedNextSteps(result.nextSteps);
      setClaimGenerated(true);
      setIsPdfReady(true);
      setActiveTab("expediente");
      await pollState(sessionId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }, [sessionId, isGenerating, pollState]);

  const handleAnalyzeReply = useCallback(
    async (reply: string) => {
      if (!sessionId || isAnalyzing) return;
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await analyzeCompanyReply(sessionId, reply);
        setCompanyAnalysis({
          originalText: reply,
          analyzedAt: new Date().toISOString(),
          analysis: result.analysis,
          weaknesses: result.weaknesses,
          recommendation: result.recommendation,
          counterReply: result.counterReply,
        });
        setCounterReplyText(result.counterReply);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [sessionId, isAnalyzing]
  );

  const handleGenerateCounter = useCallback(async () => {
    if (!sessionId || isGeneratingCounter) return;
    setIsGeneratingCounter(true);
    setError(null);

    try {
      const result = await generateCounterReply(sessionId);
      setCounterReplyText(result.counterReply);
      setCompanyAnalysis(
        (prev) =>
          prev && {
            ...prev,
            counterReply: result.counterReply,
          }
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingCounter(false);
    }
  }, [sessionId, isGeneratingCounter]);

  const handleDownloadPDF = useCallback(() => {
    if (!generatedClaim) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Permite ventanas emergentes para descargar el PDF.");
      return;
    }

    const timelineHtml = generatedTimeline
      .map(
        (t) =>
          `<tr><td style="padding:4px 8px;border:1px solid #ddd;">${t.date}</td><td style="padding:4px 8px;border:1px solid #ddd;">${t.event}</td></tr>`
      )
      .join("");

    const evidenceList = evidence
      .map(
        (e) =>
          `<li>${e.description}${e.aiAnalysis ? ` — <em>${e.aiAnalysis}</em>` : ""}</li>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Expediente AutoclAIm - ${sessionId?.slice(0, 8)}</title>
        <style>
          body { font-family: Georgia, serif; font-size: 14px; line-height: 1.6; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 22px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
          h2 { font-size: 18px; margin-top: 24px; }
          .meta { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
          th { background: #f3f4f6; }
          .claim-text { white-space: pre-wrap; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Expediente de Reclamación — AutoclAIm</h1>
        <div class="meta">ID: ${sessionId?.slice(0, 8) || ""} | Score: ${score.total}/100 | Fecha: ${new Date().toLocaleDateString("es-ES")}</div>
        <h2>Resumen</h2>
        <p>${generatedSummary}</p>
        ${
          generatedTimeline.length > 0
            ? `<h2>Cronología</h2><table><tr><th>Fecha</th><th>Evento</th></tr>${timelineHtml}</table>`
            : ""
        }
        ${
          evidence.length > 0
            ? `<h2>Evidencias</h2><ul>${evidenceList}</ul>`
            : ""
        }
        <h2>Reclamación Formal</h2>
        <div class="claim-text">${generatedClaim.replace(/\n/g, "<br>")}</div>
        <p style="margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center;">
          Generado por AutoclAIm — ${new Date().toLocaleDateString("es-ES")}
        </p>
        <script>window.onload = function() { window.print(); window.close(); };<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, [generatedClaim, generatedSummary, generatedTimeline, evidence, score.total, sessionId]);

  const renderMainContent = () => {
    switch (activeTab) {
      case "expediente":
        return (
          <ClaimView
            claim={generatedClaim}
            summary={generatedSummary}
            timeline={generatedTimeline}
            nextSteps={generatedNextSteps}
            onDownloadPDF={handleDownloadPDF}
            isPdfReady={isPdfReady}
          />
        );
      case "respuesta":
        return (
          <CompanyReply
            onAnalyze={handleAnalyzeReply}
            analysis={companyAnalysis}
            isAnalyzing={isAnalyzing}
            onGenerateCounter={handleGenerateCounter}
            isGeneratingCounter={isGeneratingCounter}
            counterReply={counterReplyText}
          />
        );
      default:
        return (
          <ResponsePanel
            onSendMessage={handleSendMessage}
            disabled={isStreaming}
            messages={messages}
            evidence={evidence}
          />
        );
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          height: "48px",
          backgroundColor: "#1f2937",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px", fontWeight: 700 }}>
            AutoclAIm
          </span>
          <span
            style={{
              fontSize: "11px",
              backgroundColor: "#3b82f6",
              padding: "2px 8px",
              borderRadius: "10px",
              fontWeight: 600,
            }}
          >
            HACKATHON
          </span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 12px",
                backgroundColor:
                  activeTab === tab ? "#374151" : "transparent",
                color: activeTab === tab ? "#fff" : "#9ca3af",
                border: "none",
                borderRadius: "6px",
                fontWeight: 500,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab === "chat"
                ? "Chat"
                : tab === "expediente"
                ? "Expediente"
                : "Respuesta"}
            </button>
          ))}
        </div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          {sessionId ? `ID: ${sessionId.slice(0, 8)}...` : "Conectando..."}
        </div>
      </header>

      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            padding: "8px 20px",
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#dc2626",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <NotebookLayout
        left={
          <DocumentosPanel
            evidence={evidence}
            onUpload={handleUploadFile}
            onDelete={handleDeleteEvidence}
            isUploading={isUploading}
          />
        }
        center={renderMainContent()}
        right={
          <Sidebar
            score={score}
            checklist={checklist}
            evidence={evidence}
            claimGenerated={claimGenerated}
            claimTypeLabel={claimTypeLabel}
            onGenerateClaim={handleGenerateClaim}
            isGenerating={isGenerating}
          />
        }
      />
    </div>
  );
}
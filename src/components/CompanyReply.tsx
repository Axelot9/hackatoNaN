import { useState } from "react";
import { CompanyResponse } from "@/types";

interface CompanyReplyProps {
  onAnalyze: (replyText: string) => void;
  analysis: CompanyResponse | null;
  isAnalyzing: boolean;
  onGenerateCounter: () => void;
  isGeneratingCounter: boolean;
  counterReply: string | null;
}

export default function CompanyReply({
  onAnalyze,
  analysis,
  isAnalyzing,
  onGenerateCounter,
  isGeneratingCounter,
  counterReply,
}: CompanyReplyProps) {
  const [replyText, setReplyText] = useState("");

  return (
    <div style={{
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      height: "100%",
      overflowY: "auto",
    }}>
      <h2 style={{
        fontSize: "18px",
        fontWeight: 700,
        color: "#1f2937",
        margin: 0,
      }}>
        Análisis de respuesta
      </h2>

      <div>
        <label style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "6px",
        }}>
          Pega la respuesta de la empresa:
        </label>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Lamentamos informarle que..."
          rows={4}
          style={{
            width: "100%",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={() => onAnalyze(replyText)}
          disabled={isAnalyzing || !replyText.trim()}
          style={{
            marginTop: "8px",
            padding: "8px 16px",
            backgroundColor: isAnalyzing || !replyText.trim() ? "#d1d5db" : "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "13px",
            cursor: isAnalyzing || !replyText.trim() ? "not-allowed" : "pointer",
          }}
        >
          {isAnalyzing ? "Analizando..." : "Analizar respuesta"}
        </button>
      </div>

      {analysis && (
        <>
          <div style={{
            backgroundColor: "#f0f9ff",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#1e40af",
          }}>
            <strong>Análisis:</strong> {analysis.analysis}
          </div>

          {analysis.weaknesses.length > 0 && (
            <div>
              <h3 style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "6px",
              }}>
                Puntos débiles de la empresa
              </h3>
              <ul style={{
                margin: 0,
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}>
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} style={{
                    fontSize: "13px",
                    color: "#dc2626",
                  }}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.recommendation && (
            <div style={{
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              color: "#166534",
            }}>
              <strong>Recomendación:</strong> {analysis.recommendation}
            </div>
          )}

          <button
            onClick={onGenerateCounter}
            disabled={isGeneratingCounter}
            style={{
              padding: "10px 16px",
              backgroundColor: isGeneratingCounter ? "#d1d5db" : "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: isGeneratingCounter ? "not-allowed" : "pointer",
            }}
          >
            {isGeneratingCounter ? "Generando..." : "Generar contrarespuesta"}
          </button>

          {counterReply && (
            <div>
              <h3 style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "6px",
              }}>
                Contrarespuesta
              </h3>
              <div style={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#1f2937",
                whiteSpace: "pre-wrap",
              }}>
                {counterReply}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
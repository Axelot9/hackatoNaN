import { Score, ChecklistItem, Evidence } from "@/types";
import ScoreGauge from "./ScoreGauge";
import Checklist from "./Checklist";

interface SidebarProps {
  score: Score;
  checklist: ChecklistItem[];
  evidence: Evidence[];
  claimGenerated: boolean;
  claimTypeLabel: string | null;
  onGenerateClaim: () => void;
  isGenerating: boolean;
}

export default function Sidebar({
  score,
  checklist,
  evidence,
  claimGenerated,
  claimTypeLabel,
  onGenerateClaim,
  isGenerating,
}: SidebarProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #e5e7eb",
        fontSize: "13px",
        fontWeight: 600,
        color: "#374151",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        Expediente
      </div>
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}>
        {claimTypeLabel && (
          <div style={{
            backgroundColor: "#f0f9ff",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "13px",
            color: "#1e40af",
            fontWeight: 500,
            textAlign: "center",
          }}>
            {claimTypeLabel}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center" }}>
          <ScoreGauge score={score.total} size="md" />
        </div>

        {score.suggestion && (
          <div style={{
            fontSize: "12px",
            color: "#6b7280",
            textAlign: "center",
            fontStyle: "italic",
          }}>
            {score.suggestion}
          </div>
        )}

        {evidence.length > 0 && (
          <div style={{
            fontSize: "13px",
            color: "#374151",
            fontWeight: 500,
          }}>
            Evidencias: {evidence.length}
          </div>
        )}

        <div>
          <div style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "8px",
          }}>
            Checklist
          </div>
          <Checklist items={checklist} />
        </div>

        <button
          onClick={onGenerateClaim}
          disabled={score.total === 0 || isGenerating || claimGenerated}
          style={{
            padding: "12px 16px",
            backgroundColor:
              score.total === 0 || isGenerating || claimGenerated
                ? "#d1d5db"
                : score.total >= 75
                ? "#22c55e"
                : "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "14px",
            cursor:
              score.total === 0 || isGenerating || claimGenerated
                ? "not-allowed"
                : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {isGenerating
            ? "Generando..."
            : claimGenerated
            ? "Expediente generado ✅"
            : "Generar expediente"}
        </button>
      </div>
    </div>
  );
}
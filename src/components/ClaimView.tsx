import { TimelineEvent } from "@/types";

interface ClaimViewProps {
  claim: string;
  summary: string;
  timeline: TimelineEvent[];
  nextSteps: string[];
  onDownloadPDF?: () => void;
  isPdfReady?: boolean;
}

export default function ClaimView({
  claim,
  summary,
  timeline,
  nextSteps,
  onDownloadPDF,
  isPdfReady,
}: ClaimViewProps) {
  return (
    <div style={{
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#1f2937",
          margin: 0,
        }}>
          Expediente generado
        </h2>
        {onDownloadPDF && (
          <button
            onClick={onDownloadPDF}
            disabled={!isPdfReady}
            style={{
              padding: "8px 16px",
              backgroundColor: isPdfReady ? "#22c55e" : "#d1d5db",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: isPdfReady ? "pointer" : "not-allowed",
            }}
          >
            {isPdfReady ? "Descargar PDF" : "Preparando PDF..."}
          </button>
        )}
      </div>

      <div style={{
        backgroundColor: "#f0fdf4",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "14px",
        lineHeight: "1.5",
        color: "#166534",
      }}>
        <strong>Resumen:</strong> {summary}
      </div>

      {timeline.length > 0 && (
        <div>
          <h3 style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "8px",
          }}>
            Cronología
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {timeline.map((event, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#4b5563",
                  padding: "4px 0",
                }}
              >
                <span style={{ fontWeight: 600, minWidth: "80px" }}>{event.date}</span>
                <span>{event.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "16px",
        fontSize: "14px",
        lineHeight: "1.6",
        color: "#1f2937",
        whiteSpace: "pre-wrap",
        fontFamily: "'Georgia', serif",
        maxHeight: "400px",
        overflowY: "auto",
      }}>
        {claim}
      </div>

      {nextSteps.length > 0 && (
        <div>
          <h3 style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "8px",
          }}>
            Siguientes pasos
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}>
            {nextSteps.map((step, i) => (
              <li key={i} style={{ fontSize: "13px", color: "#4b5563" }}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
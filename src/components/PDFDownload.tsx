import { Score, TimelineEvent, Evidence } from "@/types";

interface PDFDownloadProps {
  claim: string;
  summary: string;
  timeline: TimelineEvent[];
  evidence: Evidence[];
  score: Score;
  sessionId: string;
}

export default function PDFDownload({
  claim,
  summary,
  timeline,
  evidence,
  score,
  sessionId,
}: PDFDownloadProps) {
  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Permite ventanas emergentes para descargar el PDF.");
      return;
    }

    const evidenceList = evidence
      .map((e) => `<li>${e.description}${e.aiAnalysis ? ` — <em>${e.aiAnalysis}</em>` : ""}</li>`)
      .join("");

    const timelineHtml = timeline
      .map((t) => `<tr><td style="padding:4px 8px;border:1px solid #ddd;">${t.date}</td><td style="padding:4px 8px;border:1px solid #ddd;">${t.event}</td></tr>`)
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Expediente AutoclAIm - ${sessionId.slice(0, 8)}</title>
        <style>
          body { font-family: Georgia, serif; font-size: 14px; line-height: 1.6; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 22px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
          h2 { font-size: 18px; margin-top: 24px; }
          .score { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 16px; }
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
        <div class="meta">ID: ${sessionId} | Score: ${score.total}/100 | Fecha: ${new Date().toLocaleDateString("es-ES")}</div>

        <h2>Resumen</h2>
        <p>${summary}</p>

        ${timeline.length > 0 ? `
        <h2>Cronología</h2>
        <table>
          <tr><th>Fecha</th><th>Evento</th></tr>
          ${timelineHtml}
        </table>` : ""}

        ${evidence.length > 0 ? `
        <h2>Evidencias</h2>
        <ul>${evidenceList}</ul>` : ""}

        <h2>Reclamación Formal</h2>
        <div class="claim-text">${claim.replace(/\n/g, "<br>")}</div>

        <p style="margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center;">
          Generado por AutoclAIm — ${new Date().toLocaleDateString("es-ES")}
        </p>
        <script>
          window.onload = function() { window.print(); window.close(); };
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!claim}
      style={{
        padding: "8px 16px",
        backgroundColor: claim ? "#22c55e" : "#d1d5db",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: 600,
        fontSize: "13px",
        cursor: claim ? "pointer" : "not-allowed",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span>📄</span> Descargar PDF
    </button>
  );
}
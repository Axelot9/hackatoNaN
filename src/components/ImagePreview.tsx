import { useState } from "react";
import { Evidence } from "@/types";

interface ImagePreviewProps {
  evidence: Evidence;
}

export default function ImagePreview({ evidence }: ImagePreviewProps) {
  const [imgError, setImgError] = useState(false);

  if (evidence.type !== "image") return null;

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      overflow: "hidden",
    }}>
      <div style={{
        aspectRatio: "16/9",
        backgroundColor: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {!imgError ? (
          <img
            src={evidence.url}
            alt={evidence.description}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ color: "#9ca3af", fontSize: "13px" }}>
            Vista previa no disponible
          </span>
        )}
      </div>
      {evidence.aiAnalysis && (
        <div style={{
          padding: "8px 12px",
          backgroundColor: "#f0fdf4",
          fontSize: "13px",
          color: "#166534",
          lineHeight: "1.4",
          borderTop: "1px solid #e5e7eb",
        }}>
          <strong>Análisis:</strong> {evidence.aiAnalysis}
        </div>
      )}
    </div>
  );
}
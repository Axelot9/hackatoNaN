"use client";

import { useState, useRef } from "react";
import { Evidence } from "@/types";

interface DocumentosPanelProps {
  evidence: Evidence[];
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  isUploading: boolean;
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : "";
}

function isImageFile(evidence: Evidence): boolean {
  return evidence.type === "image";
}

function isTextFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext === ".txt";
}

export default function DocumentosPanel({
  evidence,
  onUpload,
  onDelete,
  isUploading,
}: DocumentosPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. Máximo 10MB.");
      return;
    }
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Solo se aceptan JPG, PNG, DOCX y TXT.");
      return;
    }
    onUpload(file);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          fontSize: "13px",
          fontWeight: 600,
          color: "#374151",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        DOCUMENTOS
      </div>

      <div style={{ padding: "12px 16px" }}>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.docx,.txt"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          style={{
            border: `2px dashed ${dragOver ? "#3b82f6" : "#d1d5db"}`,
            borderRadius: "8px",
            padding: "12px",
            textAlign: "center",
            cursor: isUploading ? "not-allowed" : "pointer",
            backgroundColor: dragOver ? "#eff6ff" : "transparent",
            transition: "all 0.2s ease",
            fontSize: "13px",
            color: isUploading ? "#d1d5db" : "#6b7280",
          }}
        >
          {isUploading ? (
            <span style={{ color: "#3b82f6" }}>Subiendo...</span>
          ) : (
            <>
              <span
                style={{
                  fontSize: "18px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                📎
              </span>
              Subir fichero
            </>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {evidence.length === 0 && (
          <div
            style={{
              color: "#9ca3af",
              fontSize: "13px",
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            Arrastra o haz clic para subir
          </div>
        )}
        {evidence.map((ev) => (
          <div
            key={ev.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
            }}
          >
            {isImageFile(ev) ? (
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  flexShrink: 0,
                  backgroundColor: "#f3f4f6",
                }}
              >
                <img
                  src={ev.url}
                  alt={ev.description}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "6px",
                  flexShrink: 0,
                  backgroundColor: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                {isTextFile(ev.description) ? "📝" : "📄"}
              </div>
            )}
            <span
              style={{
                flex: 1,
                fontSize: "13px",
                color: "#374151",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
              }}
              title={ev.description}
            >
              {ev.description}
            </span>
            <button
              onClick={() => onDelete(ev.id)}
              title="Eliminar"
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "transparent",
                color: "#9ca3af",
                cursor: "pointer",
                fontSize: "14px",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#fee2e2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

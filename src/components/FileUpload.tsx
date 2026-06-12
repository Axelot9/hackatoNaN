import { useState, useRef } from "react";

interface FileUploadProps {
  onUpload: (file: File) => void;
  disabled: boolean;
  isUploading: boolean;
}

export default function FileUpload({ onUpload, disabled, isUploading }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. Máximo 10MB.");
      return;
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Solo se aceptan imágenes y PDFs.");
      return;
    }
    onUpload(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <div
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        style={{
          border: `2px dashed ${dragOver ? "#3b82f6" : disabled ? "#e5e7eb" : "#d1d5db"}`,
          borderRadius: "8px",
          padding: "12px",
          textAlign: "center",
          cursor: disabled || isUploading ? "not-allowed" : "pointer",
          backgroundColor: dragOver ? "#eff6ff" : "transparent",
          transition: "all 0.2s ease",
          fontSize: "13px",
          color: disabled ? "#d1d5db" : "#6b7280",
        }}
      >
        {isUploading ? (
          <span style={{ color: "#3b82f6" }}>Subiendo evidencia...</span>
        ) : (
          <>
            <span style={{ fontSize: "18px", display: "block", marginBottom: "4px" }}>📎</span>
            {disabled ? "Espera a que la IA termine..." : "Subir foto o documento"}
          </>
        )}
      </div>
    </div>
  );
}
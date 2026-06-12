import { useState } from "react";
import { Evidence, Message } from "@/types";
import ImagePreview from "./ImagePreview";

interface ResponsePanelProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  messages: Message[];
  evidence: Evidence[];
}

export default function ResponsePanel({
  onSendMessage,
  disabled,
  messages,
  evidence,
}: ResponsePanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setInput("");
  };

  const userMessages = messages.filter((m) => m.role === "user");

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
        Tus respuestas
      </div>
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        {userMessages.map((msg, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#eff6ff",
              borderRadius: "12px 12px 4px 12px",
              padding: "12px 16px",
              fontSize: "14px",
              lineHeight: "1.5",
              color: "#1e40af",
              maxWidth: "100%",
              alignSelf: "flex-end",
              whiteSpace: "pre-wrap",
            }}
          >
            {msg.content}
          </div>
        ))}
        {evidence.map((ev) => (
          <div key={ev.id} style={{ maxWidth: "100%" }}>
            <ImagePreview evidence={ev} />
          </div>
        ))}
        {userMessages.length === 0 && evidence.length === 0 && (
          <div style={{
            color: "#9ca3af",
            fontSize: "14px",
            textAlign: "center",
            padding: "24px 0",
          }}>
            Escribe tu respuesta o sube una foto
          </div>
        )}
      </div>
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={disabled ? "La IA está escribiendo..." : "Escribe tu respuesta aquí..."}
            disabled={disabled}
            rows={2}
            style={{
              flex: 1,
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "none",
              outline: "none",
              backgroundColor: disabled ? "#f9fafb" : "#fff",
              color: disabled ? "#9ca3af" : "#1f2937",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            style={{
              padding: "10px 20px",
              backgroundColor: disabled || !input.trim() ? "#d1d5db" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: disabled || !input.trim() ? "not-allowed" : "pointer",
              alignSelf: "flex-end",
              transition: "background-color 0.2s",
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
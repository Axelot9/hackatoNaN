import { Message } from "@/types";

interface ConversationPanelProps {
  messages: Message[];
  isStreaming: boolean;
  currentStreamText: string;
}

export default function ConversationPanel({
  messages,
  isStreaming,
  currentStreamText,
}: ConversationPanelProps) {
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
        Asistente
      </div>
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        {messages.length === 0 && !isStreaming && (
          <div style={{
            color: "#9ca3af",
            fontSize: "14px",
            textAlign: "center",
            padding: "24px 0",
          }}>
            La IA te irá guiando paso a paso
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#f3f4f6",
              borderRadius: "12px 12px 12px 4px",
              padding: "12px 16px",
              fontSize: "14px",
              lineHeight: "1.5",
              color: "#1f2937",
              maxWidth: "100%",
              whiteSpace: "pre-wrap",
            }}
          >
            {msg.content}
          </div>
        ))}
        {isStreaming && (
          <div
            style={{
              backgroundColor: "#eff6ff",
              borderRadius: "12px 12px 12px 4px",
              padding: "12px 16px",
              fontSize: "14px",
              lineHeight: "1.5",
              color: "#1e40af",
              maxWidth: "100%",
              whiteSpace: "pre-wrap",
            }}
          >
            {currentStreamText}
            <span style={{
              display: "inline-block",
              width: "6px",
              height: "14px",
              backgroundColor: "#3b82f6",
              marginLeft: "2px",
              animation: "blink 0.8s infinite",
              verticalAlign: "middle",
            }} />
          </div>
        )}
        {isStreaming && !currentStreamText && (
          <div style={{
            backgroundColor: "#eff6ff",
            borderRadius: "12px 12px 12px 4px",
            padding: "12px 16px",
            fontSize: "14px",
            color: "#93c5fd",
          }}>
            <span style={{ animation: "pulse 1.5s infinite" }}>Escribiendo</span>
            <span style={{ animation: "pulse 1.5s infinite", animationDelay: "0.2s" }}>.</span>
            <span style={{ animation: "pulse 1.5s infinite", animationDelay: "0.4s" }}>.</span>
            <span style={{ animation: "pulse 1.5s infinite", animationDelay: "0.6s" }}>.</span>
          </div>
        )}
      </div>
    </div>
  );
}
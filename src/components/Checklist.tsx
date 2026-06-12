import { ChecklistItem } from "@/types";

interface ChecklistProps {
  items: ChecklistItem[];
}

export default function Checklist({ items }: ChecklistProps) {
  const completed = items.filter((i) => i.done).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{
        fontSize: "12px",
        color: "#6b7280",
        marginBottom: "4px",
        fontWeight: 500,
      }}>
        {completed} de {items.length} completados
      </div>
      {items.map((item) => (
        <div
          key={item.key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 8px",
            borderRadius: "6px",
            backgroundColor: item.done ? "#f0fdf4" : "#f9fafb",
            transition: "background-color 0.3s ease",
          }}
        >
          <span style={{
            fontSize: "14px",
            color: item.done ? "#22c55e" : "#d1d5db",
            flexShrink: 0,
          }}>
            {item.done ? "✅" : "⭕"}
          </span>
          <span style={{
            fontSize: "13px",
            color: item.done ? "#166534" : "#6b7280",
            flex: 1,
          }}>
            {item.item}
          </span>
          <span style={{
            fontSize: "11px",
            color: "#9ca3af",
            fontWeight: 500,
          }}>
            +{item.weight}
          </span>
        </div>
      ))}
    </div>
  );
}
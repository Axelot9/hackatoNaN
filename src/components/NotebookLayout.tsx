import { ReactNode } from "react";

interface NotebookLayoutProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

export default function NotebookLayout({ left, center, right }: NotebookLayoutProps) {
  return (
    <div style={{
      display: "flex",
      height: "calc(100vh - 48px)",
      backgroundColor: "#fff",
    }}>
      <div style={{
        width: "420px",
        minWidth: "420px",
        borderRight: "1px solid #e5e7eb",
        backgroundColor: "#fafafa",
        overflow: "hidden",
      }}>
        {left}
      </div>
      <div style={{
        flex: 1,
        minWidth: 0,
        borderRight: "1px solid #e5e7eb",
        overflow: "hidden",
      }}>
        {center}
      </div>
      <div style={{
        width: "300px",
        minWidth: "300px",
        backgroundColor: "#fafafa",
        overflow: "hidden",
      }}>
        {right}
      </div>
    </div>
  );
}
interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e";
  if (score >= 75) return "#4ade80";
  if (score >= 50) return "#facc15";
  if (score >= 25) return "#fb923c";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Muy sólido";
  if (score >= 75) return "Sólido";
  if (score >= 50) return "Moderado";
  if (score >= 25) return "En progreso";
  return "Débil";
}

export default function ScoreGauge({ score, size = "md" }: ScoreGaugeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const radius = size === "sm" ? 36 : size === "lg" ? 64 : 48;
  const strokeWidth = size === "sm" ? 6 : size === "lg" ? 10 : 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
    }}>
      <svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
        <circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
        />
        <text
          x={radius + strokeWidth / 2}
          y={radius + strokeWidth / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={size === "sm" ? 16 : size === "lg" ? 28 : 22}
          fontWeight="700"
          style={{ transition: "fill 0.3s ease" }}
        >
          {score}
        </text>
      </svg>
      <span style={{
        fontSize: size === "sm" ? "11px" : "13px",
        color: color,
        fontWeight: 600,
      }}>
        {label}
      </span>
    </div>
  );
}
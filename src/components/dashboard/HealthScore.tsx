"use client";

interface HealthScoreProps {
  score: number;
}

export default function HealthScore({ score }: HealthScoreProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 80
      ? "text-green-400"
      : score >= 60
        ? "text-yellow-400"
        : "text-red-400";
  const strokeColor =
    score >= 80 ? "#4ade80" : score >= 60 ? "#facc15" : "#f87171";
  const label =
    score >= 80 ? "Healthy" : score >= 60 ? "Needs Work" : "Critical";

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
        Site Health Score
      </p>

      <div className="relative">
        <svg width="160" height="160" className="-rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth="10"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>

      <p className={`text-sm font-medium mt-3 ${color}`}>{label}</p>
    </div>
  );
}

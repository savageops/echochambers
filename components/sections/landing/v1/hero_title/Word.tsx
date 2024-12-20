import { Letter } from "./Letter";

interface WordProps {
  paths: Record<string, string>;
  baseDelay?: number;
  color?: string;
}

export function Word({ paths, baseDelay = 0, color = "white" }: WordProps) {
  return (
    <svg viewBox="0 0 456 48" style={{ overflow: "visible" }}>
      {Object.entries(paths).map(([key, path], index) => (
        <g key={key} transform={`translate(${index * 1}, 0)`}>
          <Letter
            path={path}
            delay={baseDelay + index * 0.1}
            color={color}
          />
        </g>
      ))}
    </svg>
  );
}

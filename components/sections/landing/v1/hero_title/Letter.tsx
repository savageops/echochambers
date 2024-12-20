import { motion } from "framer-motion";

interface LetterProps {
  path: string;
  delay?: number;
  color?: string;
}
export function Letter({ path, delay = 0, color = "white" }: LetterProps) {
  return (
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, ease: "easeInOut", delay }}
      d={path}
      stroke="#fafafa48"
      strokeWidth="0.9"
      fill="#ffffff21"
      style={{
        filter: "drop-shadow(0 0 2px #ffffff69) drop-shadow(0 0 4px #ffffff69) drop-shadow(0 0 8px #ffffff69)",
        overflow: "visible"
      }}
    />
  );
}
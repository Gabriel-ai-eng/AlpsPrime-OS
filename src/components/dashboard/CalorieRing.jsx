import React from "react";
import { motion } from "framer-motion";

export default function CalorieRing({ consumed, goal }) {
  const percentage = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isOver = consumed > goal;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="220" height="220" viewBox="0 0 200 200" className="-rotate-90">
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
        />
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={isOver ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-extrabold font-display text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {consumed}
        </motion.span>
        <span className="text-sm text-muted-foreground font-medium mt-1">
          de {goal} kcal
        </span>
        <span className={`text-xs font-semibold mt-1 ${isOver ? "text-destructive" : "text-primary"}`}>
          {isOver ? `+${consumed - goal} excedido` : `${remaining} restante`}
        </span>
      </div>
    </div>
  );
}
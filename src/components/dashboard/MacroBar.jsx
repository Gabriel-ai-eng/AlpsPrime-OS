import React from "react";
import { motion } from "framer-motion";

export default function MacroBar({ label, value, max, unit, color }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{Math.round(value)}</span>
          <span className="text-xs">/{max}{unit}</span>
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
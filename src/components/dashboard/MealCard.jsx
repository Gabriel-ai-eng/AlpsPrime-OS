import React from "react";
import { motion } from "framer-motion";
import { Trash2, Coffee, Sun, Cookie, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const mealTypeConfig = {
  cafe_da_manha: { label: "Café da Manhã", icon: Coffee, gradient: "from-amber-400 to-orange-500" },
  almoco: { label: "Almoço", icon: Sun, gradient: "from-emerald-400 to-teal-500" },
  lanche: { label: "Lanche", icon: Cookie, gradient: "from-violet-400 to-purple-500" },
  jantar: { label: "Jantar", icon: Moon, gradient: "from-blue-400 to-indigo-500" },
};

export default function MealCard({ meal, onDelete, index }) {
  const config = mealTypeConfig[meal.meal_type] || mealTypeConfig.almoco;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300"
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{meal.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {config.label} {meal.quantity && `· ${meal.quantity}`}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-foreground">{meal.calories}</p>
        <p className="text-xs text-muted-foreground">kcal</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(meal.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
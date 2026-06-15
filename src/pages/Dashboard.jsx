import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, addDays, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Settings, Flame, Zap, Droplets, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

import CalorieRing from "@/components/dashboard/CalorieRing";
import MacroBar from "@/components/dashboard/MacroBar";
import MealCard from "@/components/dashboard/MealCard";
import AddMealDialog from "@/components/dashboard/AddMealDialog";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import GoalSetting from "@/components/dashboard/GoalSetting";

export default function Dashboard() {
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [goals, setGoals] = useState({ calories: 2000, protein: 120, carbs: 250, fat: 65 });
  const queryClient = useQueryClient();

  useEffect(() => {
    const saved = localStorage.getItem("fitnoa_goals");
    if (saved) setGoals(JSON.parse(saved));
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ["meals"],
    queryFn: () => base44.entities.Meal.list("-created_date", 200),
  });

  const todayMeals = useMemo(
    () => meals.filter((m) => m.date === today),
    [meals, today]
  );

  const todayTotals = useMemo(() => {
    return todayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.calories || 0),
        protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0),
        fat: acc.fat + (m.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayMeals]);

  const weekData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = format(addDays(weekStart, i), "yyyy-MM-dd");
      return meals
        .filter((m) => m.date === day)
        .reduce((sum, m) => sum + (m.calories || 0), 0);
    });
  }, [meals]);

  const handleDelete = async (id) => {
    await base44.entities.Meal.delete(id);
    queryClient.invalidateQueries({ queryKey: ["meals"] });
  };

  const handleGoalSave = (newGoals) => {
    setGoals(newGoals);
    localStorage.setItem("fitnoa_goals", JSON.stringify(newGoals));
  };

  const mealsByType = useMemo(() => {
    const order = ["cafe_da_manha", "almoco", "lanche", "jantar"];
    const grouped = {};
    order.forEach((t) => {
      const items = todayMeals.filter((m) => m.meal_type === t);
      if (items.length > 0) grouped[t] = items;
    });
    return grouped;
  }, [todayMeals]);

  const typeLabels = {
    cafe_da_manha: "Café da Manhã",
    almoco: "Almoço",
    lanche: "Lanche",
    jantar: "Jantar",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground">FitNoa</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGoal(true)}
            className="text-muted-foreground"
          >
            <Target className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pb-28 space-y-6 pt-6">
        {/* Calorie Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <CalorieRing consumed={Math.round(todayTotals.calories)} goal={goals.calories} />
        </motion.div>

        {/* Macros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Proteína", value: todayTotals.protein, max: goals.protein, icon: Zap, color: "hsl(200, 65%, 50%)" },
            { label: "Carbos", value: todayTotals.carbs, max: goals.carbs, icon: Flame, color: "hsl(35, 85%, 55%)" },
            { label: "Gordura", value: todayTotals.fat, max: goals.fat, icon: Droplets, color: "hsl(340, 70%, 55%)" },
          ].map((macro) => (
            <div key={macro.label} className="p-3 rounded-2xl bg-card border border-border/50 text-center">
              <macro.icon className="w-4 h-4 mx-auto mb-1" style={{ color: macro.color }} />
              <p className="text-lg font-bold text-foreground">{Math.round(macro.value)}g</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{macro.label}</p>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: macro.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((macro.value / macro.max) * 100, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WeeklyChart weekData={weekData} goal={goals.calories} />
        </motion.div>

        {/* Today's Meals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-heading text-foreground">Refeições de Hoje</h2>
            <span className="text-sm text-muted-foreground">{todayMeals.length} itens</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : Object.keys(mealsByType).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Flame className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Nenhuma refeição registrada</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Toque no + para adicionar</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(mealsByType).map(([type, items]) => (
                <div key={type}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    {typeLabels[type]}
                  </p>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {items.map((meal, i) => (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          onDelete={handleDelete}
                          index={i}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* FAB */}
      <motion.div
        className="fixed bottom-6 right-6 z-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Button
          onClick={() => setShowAddMeal(true)}
          size="icon"
          className="w-14 h-14 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      <AddMealDialog
        open={showAddMeal}
        onOpenChange={setShowAddMeal}
        onMealAdded={() => queryClient.invalidateQueries({ queryKey: ["meals"] })}
      />
      <GoalSetting
        open={showGoal}
        onOpenChange={setShowGoal}
        currentGoal={goals.calories}
        onSave={handleGoalSave}
      />
    </div>
  );
}
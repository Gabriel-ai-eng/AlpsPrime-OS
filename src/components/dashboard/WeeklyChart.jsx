import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Card } from "@/components/ui/card";

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function WeeklyChart({ weekData, goal }) {
  const data = weekData.map((calories, i) => ({
    day: dayLabels[i],
    calories,
    isOver: calories > goal,
  }));

  const maxVal = Math.max(...weekData, goal) * 1.15;

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Resumo Semanal</h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis hide domain={[0, maxVal]} />
            <ReferenceLine
              y={goal}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isOver ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                  opacity={entry.calories === 0 ? 0.2 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
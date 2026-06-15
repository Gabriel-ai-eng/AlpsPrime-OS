import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const presets = [
  { label: "Emagrecer", calories: 1500, desc: "Déficit calórico" },
  { label: "Manter", calories: 2000, desc: "Equilíbrio" },
  { label: "Ganhar massa", calories: 2500, desc: "Superávit" },
];

export default function GoalSetting({ open, onOpenChange, currentGoal, onSave }) {
  const [goal, setGoal] = useState(currentGoal);
  const [proteinGoal, setProteinGoal] = useState(120);
  const [carbsGoal, setCarbsGoal] = useState(250);
  const [fatGoal, setFatGoal] = useState(65);

  const handleSave = () => {
    onSave({ calories: goal, protein: proteinGoal, carbs: carbsGoal, fat: fatGoal });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Meta Diária</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-3 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setGoal(preset.calories)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  goal === preset.calories
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className="font-semibold text-sm">{preset.label}</p>
                <p className="text-xs text-muted-foreground">{preset.calories} kcal</p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <Label>Calorias personalizadas</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[goal]}
                onValueChange={([v]) => setGoal(v)}
                min={1000}
                max={4000}
                step={50}
                className="flex-1"
              />
              <Input
                type="number"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="w-24 h-10 text-center font-semibold"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full h-11">
            Salvar Meta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
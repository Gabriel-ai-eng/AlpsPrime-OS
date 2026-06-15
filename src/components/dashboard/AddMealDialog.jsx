import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export default function AddMealDialog({ open, onOpenChange, onMealAdded }) {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [mealType, setMealType] = useState("almoco");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const analyzeFood = async () => {
    if (!foodName.trim()) return;
    setIsAnalyzing(true);
    setNutritionData(null);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analise as informações nutricionais do seguinte alimento/refeição: "${foodName}"${quantity ? `, quantidade: ${quantity}` : ""}. 
      Retorne os dados nutricionais estimados. Seja preciso e realista com os valores. Se a quantidade não for especificada, use uma porção padrão.`,
      response_json_schema: {
        type: "object",
        properties: {
          calories: { type: "number", description: "Calorias totais em kcal" },
          protein: { type: "number", description: "Proteínas em gramas" },
          carbs: { type: "number", description: "Carboidratos em gramas" },
          fat: { type: "number", description: "Gorduras em gramas" },
          estimated_quantity: { type: "string", description: "Quantidade estimada se não fornecida" }
        }
      }
    });

    setNutritionData(result);
    setIsAnalyzing(false);
  };

  const saveMeal = async () => {
    if (!nutritionData) return;
    setIsSaving(true);

    await base44.entities.Meal.create({
      name: foodName,
      calories: Math.round(nutritionData.calories),
      protein: Math.round(nutritionData.protein * 10) / 10,
      carbs: Math.round(nutritionData.carbs * 10) / 10,
      fat: Math.round(nutritionData.fat * 10) / 10,
      meal_type: mealType,
      date: format(new Date(), "yyyy-MM-dd"),
      quantity: quantity || nutritionData.estimated_quantity || "1 porção"
    });

    setIsSaving(false);
    resetForm();
    onOpenChange(false);
    onMealAdded();
  };

  const resetForm = () => {
    setFoodName("");
    setQuantity("");
    setMealType("almoco");
    setNutritionData(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Adicionar Refeição</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>O que você comeu?</Label>
            <Input
              placeholder="Ex: 2 ovos fritos com pão"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Quantidade (opcional)</Label>
              <Input
                placeholder="Ex: 200g, 1 prato"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cafe_da_manha">Café da Manhã</SelectItem>
                  <SelectItem value="almoco">Almoço</SelectItem>
                  <SelectItem value="lanche">Lanche</SelectItem>
                  <SelectItem value="jantar">Jantar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!nutritionData && (
            <Button
              onClick={analyzeFood}
              disabled={!foodName.trim() || isAnalyzing}
              className="w-full h-12 text-base gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analisando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Calcular Calorias com IA
                </>
              )}
            </Button>
          )}

          {nutritionData && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Calorias", value: Math.round(nutritionData.calories), unit: "kcal", color: "text-primary" },
                  { label: "Proteína", value: Math.round(nutritionData.protein * 10) / 10, unit: "g", color: "text-blue-500" },
                  { label: "Carbos", value: Math.round(nutritionData.carbs * 10) / 10, unit: "g", color: "text-amber-500" },
                  { label: "Gordura", value: Math.round(nutritionData.fat * 10) / 10, unit: "g", color: "text-rose-500" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl bg-muted/60">
                    <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setNutritionData(null)} className="flex-1 h-11">
                  Refazer
                </Button>
                <Button onClick={saveMeal} disabled={isSaving} className="flex-1 h-11">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Refeição"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
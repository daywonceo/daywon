import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ChefHat, StickyNote, ChevronRight } from 'lucide-react';

const MealPlannerTab: React.FC = () => {
  const [goals, setGoals] = useState('Fat loss');
  const [preferences, setPreferences] = useState('High protein, simple meals');
  const [calories, setCalories] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  const [showMeal, setShowMeal] = useState(false);
  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('plan-meals', {
        body: {
          goals: { summary: goals },
          preferences: { summary: preferences },
          calories_target: calories || null,
        },
      });
      if (error) throw error;
      setPlan(data?.plan || null);
    } catch (e: any) {
      setError(e.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const exportToNotes = async () => {
    if (!plan) return;
    try {
      const summaryLines: string[] = [];
      summaryLines.push(plan?.title || `Meal Plan – Week of ${plan.plan_start}`);
      for (const day of plan.meals || []) {
        summaryLines.push(`\n${day.date}`);
        for (const m of day.meals || []) {
          summaryLines.push(`• ${m.name} (${m.macros?.calories || '?'} kcal)`);
        }
      }
      const text = summaryLines.join('\n');
      await supabase.from('user_reflections').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        reflection_text: text,
        devotion_title: 'Meal Plan',
      });
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Smart Meal Planner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Goals</label>
            <Input value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="e.g., Lean bulk, fat loss" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Preferences</label>
            <Textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="e.g., High protein, lactose free, quick prep" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Calories Target (optional)</label>
            <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : '')} placeholder="e.g., 2000" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={generate} disabled={loading} className="w-full sm:w-auto">{loading ? 'Generating…' : (<><ChefHat className="mr-2 h-4 w-4" /> Generate plan</>)}</Button>
            <Button variant="outline" onClick={exportToNotes} disabled={!plan} className="w-full sm:w-auto"><StickyNote className="mr-2 h-4 w-4" /> Export to Notes</Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {plan && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>{plan.title || `Meal Plan – Week of ${plan.plan_start}`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {(plan.meals || []).map((day: any) => (
                <div key={day.date} className="border rounded p-3">
                  <div className="text-sm text-muted-foreground mb-2 font-medium">{day.date}</div>
                  <ul className="space-y-2">
                    {(day.meals || []).map((m: any, idx: number) => (
                      <li key={idx}>
                        <button
                          onClick={() => { setSelectedMeal(m); setShowMeal(true); }}
                          className="w-full text-left rounded-lg p-3 hover:bg-accent transition focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label={`View details for ${m.name}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{m.name}</div>
                              <div className="mt-1 flex flex-wrap gap-2">
                                <Badge variant="secondary">{m.macros?.calories ?? '?'} kcal</Badge>
                                <Badge variant="outline">P {m.macros?.protein_g ?? '?'}g</Badge>
                                <Badge variant="outline">C {m.macros?.carbs_g ?? '?'}g</Badge>
                                <Badge variant="outline">F {m.macros?.fat_g ?? '?'}g</Badge>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showMeal} onOpenChange={setShowMeal}>
        <DialogContent className="max-w-md sm:max-w-lg w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>{selectedMeal?.name}</DialogTitle>
            <DialogDescription>
              Detailed macros and cooking instructions
            </DialogDescription>
          </DialogHeader>
          {selectedMeal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="rounded-md bg-muted p-2">
                  <div className="text-xs text-muted-foreground">Calories</div>
                  <div className="font-medium">{selectedMeal.macros?.calories ?? '?'}</div>
                </div>
                <div className="rounded-md bg-muted p-2">
                  <div className="text-xs text-muted-foreground">Protein</div>
                  <div className="font-medium">{selectedMeal.macros?.protein_g ?? '?'} g</div>
                </div>
                <div className="rounded-md bg-muted p-2">
                  <div className="text-xs text-muted-foreground">Carbs</div>
                  <div className="font-medium">{selectedMeal.macros?.carbs_g ?? '?'} g</div>
                </div>
                <div className="rounded-md bg-muted p-2">
                  <div className="text-xs text-muted-foreground">Fat</div>
                  <div className="font-medium">{selectedMeal.macros?.fat_g ?? '?'} g</div>
                </div>
              </div>
              <div>
                <div className="text-xs mb-1 text-muted-foreground">Ingredients</div>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {(selectedMeal.ingredients || []).map((ing: string, i: number) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
              {selectedMeal.instructions_url && (
                <div>
                  <a
                    href={selectedMeal.instructions_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline text-primary"
                  >
                    View cooking instructions
                  </a>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => setShowMeal(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlannerTab;

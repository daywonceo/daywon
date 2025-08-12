import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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
      <Card className="bg-white dark:bg-gray-800/50">
        <CardHeader>
          <CardTitle>Smart Meal Planner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="block text-xs mb-1">Goals</label>
            <Input value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="e.g., Lean bulk, fat loss" />
          </div>
          <div>
            <label className="block text-xs mb-1">Preferences</label>
            <Textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="e.g., High protein, lactose free, quick prep" />
          </div>
          <div>
            <label className="block text-xs mb-1">Calories Target (optional)</label>
            <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : '')} placeholder="e.g., 2000" />
          </div>
          <div className="flex gap-2">
            <Button onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate / Regenerate'}</Button>
            <Button variant="outline" onClick={exportToNotes} disabled={!plan}>Export to Notes</Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {plan && (
        <Card className="bg-white dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle>{plan.title || `Meal Plan – Week of ${plan.plan_start}`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {(plan.meals || []).map((day: any) => (
                <div key={day.date} className="border rounded p-3">
                  <div className="font-semibold mb-2">{day.date}</div>
                  <ul className="space-y-2">
                    {(day.meals || []).map((m: any, idx: number) => (
                      <li key={idx}>
                        <button
                          onClick={() => { setSelectedMeal(m); setShowMeal(true); }}
                          className="w-full text-left rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition"
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
                            <span className="text-xs text-gray-500 shrink-0">Tap for details</span>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMeal?.name}</DialogTitle>
            <DialogDescription>
              Detailed macros and cooking instructions
            </DialogDescription>
          </DialogHeader>
          {selectedMeal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded bg-gray-50 dark:bg-gray-800/50 p-2">
                  <div className="text-xs text-gray-500">Calories</div>
                  <div className="font-medium">{selectedMeal.macros?.calories ?? '?'}</div>
                </div>
                <div className="rounded bg-gray-50 dark:bg-gray-800/50 p-2">
                  <div className="text-xs text-gray-500">Protein</div>
                  <div className="font-medium">{selectedMeal.macros?.protein_g ?? '?'} g</div>
                </div>
                <div className="rounded bg-gray-50 dark:bg-gray-800/50 p-2">
                  <div className="text-xs text-gray-500">Carbs</div>
                  <div className="font-medium">{selectedMeal.macros?.carbs_g ?? '?'} g</div>
                </div>
                <div className="rounded bg-gray-50 dark:bg-gray-800/50 p-2">
                  <div className="text-xs text-gray-500">Fat</div>
                  <div className="font-medium">{selectedMeal.macros?.fat_g ?? '?'} g</div>
                </div>
              </div>
              <div>
                <div className="text-xs mb-1 text-gray-500">Ingredients</div>
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
                    className="text-sm underline text-blue-600 dark:text-blue-400"
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

import { supabase } from "@/integrations/supabase/client";

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  workout_type: string;
  difficulty: string;
  estimated_duration_minutes?: number;
  exercises: any[];
  is_public: boolean;
  times_used: number;
  created_at: string;
  updated_at: string;
}

export const workoutTemplateService = {
  async fetchUserTemplates(userId: string) {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as WorkoutTemplate[];
  },

  async fetchPublicTemplates() {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('is_public', true)
      .order('times_used', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data as WorkoutTemplate[];
  },

  async createTemplate(template: Omit<WorkoutTemplate, 'id' | 'created_at' | 'updated_at' | 'times_used'>) {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert([{
        ...template,
        times_used: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutTemplate;
  },

  async updateTemplate(id: string, updates: Partial<WorkoutTemplate>) {
    const { data, error } = await supabase
      .from('workout_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutTemplate;
  },

  async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async incrementTimesUsed(id: string) {
    const { error } = await supabase.rpc('increment', {
      table_name: 'workout_templates',
      row_id: id,
      column_name: 'times_used'
    });

    // Fallback if RPC doesn't exist
    if (error) {
      const { data: template } = await supabase
        .from('workout_templates')
        .select('times_used')
        .eq('id', id)
        .single();

      if (template) {
        await supabase
          .from('workout_templates')
          .update({ times_used: (template.times_used || 0) + 1 })
          .eq('id', id);
      }
    }
  }
};

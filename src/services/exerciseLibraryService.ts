import { supabase } from '@/integrations/supabase/client';

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string | null;
  difficulty: string;
  exercise_type: string;
  instructions: string | null;
  video_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const fetchExercisesFromLibrary = async (params: {
  muscle_group?: string;
  difficulty?: string;
  exercise_type?: string;
  name?: string;
  limit?: number;
} = {}): Promise<ExerciseLibraryItem[]> => {
  console.log('Fetching exercises from library:', params);
  
  let query = supabase
    .from('exercise_library')
    .select('*');

  if (params.muscle_group) {
    query = query.eq('muscle_group', params.muscle_group);
  }

  if (params.difficulty) {
    query = query.eq('difficulty', params.difficulty);
  }

  if (params.exercise_type) {
    query = query.eq('exercise_type', params.exercise_type);
  }

  if (params.name) {
    query = query.ilike('name', `%${params.name}%`);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching exercises from library:', error);
    throw new Error(`Failed to fetch exercises: ${error.message}`);
  }

  console.log(`Fetched ${data?.length || 0} exercises from library`);
  return data || [];
};

export const searchExercises = async (searchTerm: string, limit: number = 20): Promise<ExerciseLibraryItem[]> => {
  console.log('Searching exercises:', searchTerm);
  
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,muscle_group.ilike.%${searchTerm}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching exercises:', error);
    throw new Error(`Failed to search exercises: ${error.message}`);
  }

  return data || [];
};

export const getExercisesByMuscleGroup = async (muscleGroup: string): Promise<ExerciseLibraryItem[]> => {
  return fetchExercisesFromLibrary({ muscle_group: muscleGroup });
};

export const findAlternativeExercises = async (
  exerciseName: string,
  muscleGroup: string,
  limit: number = 3
): Promise<ExerciseLibraryItem[]> => {
  console.log('Finding alternatives for:', exerciseName, muscleGroup);
  
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .eq('muscle_group', muscleGroup)
    .neq('name', exerciseName)
    .limit(limit);

  if (error) {
    console.error('Error finding alternative exercises:', error);
    return [];
  }

  return data || [];
};

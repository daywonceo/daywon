import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutTemplateService, WorkoutTemplate } from "@/services/workoutTemplateService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useWorkoutTemplates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userTemplates = useQuery({
    queryKey: ['workout-templates', user?.id],
    queryFn: () => workoutTemplateService.fetchUserTemplates(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const publicTemplates = useQuery({
    queryKey: ['workout-templates', 'public'],
    queryFn: () => workoutTemplateService.fetchPublicTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const createTemplate = useMutation({
    mutationFn: (template: Omit<WorkoutTemplate, 'id' | 'created_at' | 'updated_at' | 'times_used'>) =>
      workoutTemplateService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
      toast.success("Template saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save template");
    }
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WorkoutTemplate> }) =>
      workoutTemplateService.updateTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
      toast.success("Template updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update template");
    }
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => workoutTemplateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
      toast.success("Template deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete template");
    }
  });

  const incrementUsage = useMutation({
    mutationFn: (id: string) => workoutTemplateService.incrementTimesUsed(id),
  });

  return {
    userTemplates: userTemplates.data || [],
    publicTemplates: publicTemplates.data || [],
    isLoading: userTemplates.isLoading || publicTemplates.isLoading,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    incrementUsage: incrementUsage.mutate,
    isCreating: createTemplate.isPending,
  };
};

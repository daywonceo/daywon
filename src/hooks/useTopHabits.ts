
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Format: "YYYY-MM" (e.g., "2024-06")
 */
export function getCurrentMonthString() {
  const now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
}

async function fetchUserTopHabits(userId: string, month: string) {
  const { data, error } = await supabase
    .from("user_top_habits")
    .select("habits")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  if (error && error.code !== "PGRST116" /* not found */) throw error;
  return data?.habits ?? null;
}

async function saveUserTopHabits(userId: string, month: string, habits: string[]) {
  // Upsert
  const { error } = await supabase
    .from("user_top_habits")
    .upsert([{ user_id: userId, month, habits }], { onConflict: "user_id,month" });
  if (error) throw error;
}

export function useTopHabits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const month = getCurrentMonthString();

  // Query for this user's top habits for this month
  const { data: habits, isLoading, refetch } = useQuery({
    queryKey: ["topHabits", user?.id, month],
    enabled: !!user?.id,
    queryFn: () => fetchUserTopHabits(user!.id, month),
  });

  const mutation = useMutation({
    mutationFn: (newHabits: string[]) => saveUserTopHabits(user!.id, month, newHabits),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topHabits", user?.id, month] });
    },
  });

  return {
    topHabits: habits,
    isLoading,
    saveTopHabits: mutation.mutateAsync,
    refetch,
  };
}

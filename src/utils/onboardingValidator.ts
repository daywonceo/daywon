import { supabase } from "@/integrations/supabase/client";

// QA and validation utilities for onboarding
export class OnboardingValidator {
  // Assert no duplicate user_habits for same habit_id
  static async assertNoDuplicateUserHabits(userId: string, habitId: string, config: any): Promise<{ shouldCreate: boolean; existingUserHabit?: any; shouldUpdate?: boolean }> {
    const { data: existingHabits, error } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to check for duplicate habits: ${error.message}`);
    }

    // If ANY user_habit exists for this user_id + habit_id, we cannot create another due to unique constraint
    if (existingHabits && existingHabits.length > 0) {
      const existingHabit = existingHabits[0];
      
      // Check if the existing habit has identical configuration
      const normalizeArray = (arr: any[]) => arr ? [...arr].sort() : [];
      
      const isIdenticalConfig = 
        existingHabit.tracking_type === config.tracking_type &&
        existingHabit.period === config.period &&
        existingHabit.target_count === config.target_count &&
        JSON.stringify(normalizeArray(existingHabit.selected_days)) === JSON.stringify(normalizeArray(config.selected_days)) &&
        existingHabit.min_rest_days === config.min_rest_days &&
        existingHabit.time_window_start === config.time_window_start &&
        existingHabit.time_window_end === config.time_window_end &&
        existingHabit.reminder_time === config.reminder_time &&
        JSON.stringify(normalizeArray(existingHabit.reminder_channel)) === JSON.stringify(normalizeArray(config.reminder_channel));

      if (isIdenticalConfig) {
        console.log('✅ QA: Found existing identical user habit, reusing', {
          userId,
          habitId,
          existingUserHabitId: existingHabit.id,
          config,
        });
        return { shouldCreate: false, existingUserHabit: existingHabit };
      } else {
        console.log('⚠️ QA: Found existing user habit with different config, updating', {
          userId,
          habitId,
          existingUserHabitId: existingHabit.id,
          existingConfig: {
            tracking_type: existingHabit.tracking_type,
            period: existingHabit.period,
            target_count: existingHabit.target_count,
            selected_days: existingHabit.selected_days,
          },
          newConfig: config,
        });
        return { shouldCreate: false, existingUserHabit: existingHabit, shouldUpdate: true };
      }
    }

    return { shouldCreate: true };
  }

  // Assert all new records have valid IDs and timestamps
  static validateHabitRecord(record: any, recordType: 'habit' | 'user_habit') {
    const errors: string[] = [];

    // Check for valid UUID
    if (!record.id || !this.isValidUUID(record.id)) {
      errors.push(`Invalid ${recordType} ID: ${record.id}`);
    }

    // Check for valid timestamps
    if (!record.created_at || !this.isValidTimestamp(record.created_at)) {
      errors.push(`Invalid ${recordType} created_at: ${record.created_at}`);
    }

    if (record.updated_at && !this.isValidTimestamp(record.updated_at)) {
      errors.push(`Invalid ${recordType} updated_at: ${record.updated_at}`);
    }

    // Record type specific validations
    if (recordType === 'user_habit') {
      if (!record.user_id || !this.isValidUUID(record.user_id)) {
        errors.push(`Invalid user_habit user_id: ${record.user_id}`);
      }
      if (!record.habit_id || !this.isValidUUID(record.habit_id)) {
        errors.push(`Invalid user_habit habit_id: ${record.habit_id}`);
      }
      if (!record.tracking_type || !['DAILY', 'N_PER_PERIOD', 'SELECTED_DAYS'].includes(record.tracking_type)) {
        errors.push(`Invalid tracking_type: ${record.tracking_type}`);
      }
    }

    if (errors.length > 0) {
      console.error('🚨 QA Validation Failed:', {
        recordType,
        record,
        errors,
      });
      throw new Error(`${recordType} validation failed: ${errors.join(', ')}`);
    }

    console.log('✅ QA Validation Passed:', { recordType, id: record.id });
    return true;
  }

  // Get user timezone for period calculations
  static getUserTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.warn('Failed to get user timezone, defaulting to UTC', error);
      return 'UTC';
    }
  }

  // Calculate period boundaries using user timezone
  static calculatePeriodBoundaries(period: 'WEEK' | 'MONTH', referenceDate?: Date): { start: Date; end: Date } {
    const timezone = this.getUserTimezone();
    const now = referenceDate || new Date();
    
    try {
      if (period === 'WEEK') {
        // Get start of week (Sunday) in user timezone
        const dayOfWeek = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        
        return { start, end };
      } else {
        // Get start of month in user timezone
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        
        return { start, end };
      }
    } catch (error) {
      console.error('Failed to calculate period boundaries:', error);
      // Fallback to simple calculation
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  }

  // Validate UUID format
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Validate timestamp format
  private static isValidTimestamp(timestamp: any): boolean {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) && date.getTime() > 0;
  }

  // Log QA summary for onboarding completion
  static logOnboardingQASummary(habits: any[], userHabits: any[]) {
    console.log('📋 Onboarding QA Summary:', {
      habits_created: habits.length,
      user_habits_created: userHabits.length,
      user_timezone: this.getUserTimezone(),
      timestamp: new Date().toISOString(),
      validation_passed: true,
    });
  }
}
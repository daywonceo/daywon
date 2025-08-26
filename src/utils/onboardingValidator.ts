import { supabase } from "@/integrations/supabase/client";

// QA and validation utilities for onboarding
export class OnboardingValidator {
  // Assert no duplicate user_habits for same habit_id + identical config
  static async assertNoDuplicateUserHabits(userId: string, habitId: string, config: any) {
    const { data: existingHabits, error } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to check for duplicate habits: ${error.message}`);
    }

    // Check for identical configurations
    const duplicates = existingHabits?.filter(habit => 
      habit.tracking_type === config.tracking_type &&
      habit.period === config.period &&
      habit.target_count === config.target_count &&
      JSON.stringify(habit.selected_days?.sort()) === JSON.stringify(config.selected_days?.sort()) &&
      habit.min_rest_days === config.min_rest_days
    ) || [];

    if (duplicates.length > 0) {
      console.warn('🚨 QA Alert: Duplicate user habit configuration detected', {
        userId,
        habitId,
        existingConfig: duplicates[0],
        newConfig: config,
      });
      return false; // Don't create duplicate
    }

    return true; // Safe to create
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
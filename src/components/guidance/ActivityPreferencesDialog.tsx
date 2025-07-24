import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings } from 'lucide-react';
import { ActivityCategory, UserActivityPreferences } from '@/data/enhancedActivities';
import { useActivityPreferences } from '@/hooks/useActivityPreferences';

const CATEGORIES: { id: ActivityCategory; label: string; description: string }[] = [
  { id: 'creative', label: 'Creative', description: 'Art, writing, music, crafts' },
  { id: 'learning', label: 'Learning', description: 'Skills, languages, education' },
  { id: 'physical', label: 'Physical', description: 'Exercise, sports, outdoor activities' },
  { id: 'social', label: 'Social', description: 'Community, networking, volunteering' },
  { id: 'professional', label: 'Professional', description: 'Career development, productivity' },
  { id: 'mindfulness', label: 'Mindfulness', description: 'Meditation, reflection, spirituality' },
  { id: 'technology', label: 'Technology', description: 'Programming, digital creation' },
  { id: 'culinary', label: 'Culinary', description: 'Cooking, baking, food exploration' },
  { id: 'crafts', label: 'Crafts', description: 'DIY projects, handmade items' },
  { id: 'music', label: 'Music', description: 'Playing, composing, listening' },
  { id: 'writing', label: 'Writing', description: 'Creative writing, journaling' },
  { id: 'outdoor', label: 'Outdoor', description: 'Nature, adventure, exploration' }
];

const MOODS = [
  { id: 'creative', label: 'Creative', description: 'Express yourself artistically' },
  { id: 'analytical', label: 'Analytical', description: 'Solve problems and think logically' },
  { id: 'physical', label: 'Physical', description: 'Move your body and be active' },
  { id: 'social', label: 'Social', description: 'Connect with others' },
  { id: 'reflective', label: 'Reflective', description: 'Think deeply and contemplate' },
  { id: 'adventurous', label: 'Adventurous', description: 'Try something new and exciting' }
];

interface ActivityPreferencesDialogProps {
  children: React.ReactNode;
}

const ActivityPreferencesDialog: React.FC<ActivityPreferencesDialogProps> = ({ children }) => {
  const { preferences, setPreferences } = useActivityPreferences();

  const handleCategoryChange = (categoryId: ActivityCategory, checked: boolean) => {
    const newCategories = checked
      ? [...preferences.preferredCategories, categoryId]
      : preferences.preferredCategories.filter(id => id !== categoryId);
    
    setPreferences({ preferredCategories: newCategories });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Activity Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preferred Categories */}
          <div>
            <Label className="text-base font-semibold">Preferred Categories</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Select the types of activities you're most interested in
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={preferences.preferredCategories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.label}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Mood */}
          <div>
            <Label className="text-base font-semibold">Current Mood</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              How are you feeling right now? This helps us suggest the right activities.
            </p>
            <RadioGroup
              value={preferences.currentMood || ''}
              onValueChange={(value) => setPreferences({ currentMood: value as any })}
            >
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map((mood) => (
                  <div key={mood.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={mood.id} id={`mood-${mood.id}`} />
                    <div className="flex-1">
                      <label
                        htmlFor={`mood-${mood.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {mood.label}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {mood.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Available Time */}
          <div>
            <Label className="text-base font-semibold">Available Time</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              How much time do you typically have for activities?
            </p>
            <RadioGroup
              value={preferences.availableTime}
              onValueChange={(value) => setPreferences({ availableTime: value as any })}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quick" id="time-quick" />
                  <label htmlFor="time-quick" className="text-sm font-medium cursor-pointer">
                    Quick (30 minutes or less)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="time-medium" />
                  <label htmlFor="time-medium" className="text-sm font-medium cursor-pointer">
                    Medium (1-2 hours)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long" id="time-long" />
                  <label htmlFor="time-long" className="text-sm font-medium cursor-pointer">
                    Long (2+ hours)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="time-flexible" />
                  <label htmlFor="time-flexible" className="text-sm font-medium cursor-pointer">
                    Flexible (any duration)
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Difficulty Level */}
          <div>
            <Label className="text-base font-semibold">Difficulty Level</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              What level of challenge are you looking for?
            </p>
            <RadioGroup
              value={preferences.difficultyLevel}
              onValueChange={(value) => setPreferences({ difficultyLevel: value as any })}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="diff-beginner" />
                  <label htmlFor="diff-beginner" className="text-sm font-medium cursor-pointer">
                    Beginner - Easy to start, minimal experience needed
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="diff-intermediate" />
                  <label htmlFor="diff-intermediate" className="text-sm font-medium cursor-pointer">
                    Intermediate - Some experience helpful
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="diff-advanced" />
                  <label htmlFor="diff-advanced" className="text-sm font-medium cursor-pointer">
                    Advanced - Challenging and complex
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="diff-mixed" />
                  <label htmlFor="diff-mixed" className="text-sm font-medium cursor-pointer">
                    Mixed - All difficulty levels
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Location and Social Preferences */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-semibold">Location Preference</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Where do you prefer to do activities?
              </p>
              <RadioGroup
                value={preferences.preferredLocation}
                onValueChange={(value) => setPreferences({ preferredLocation: value as any })}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="indoor" id="loc-indoor" />
                    <label htmlFor="loc-indoor" className="text-sm font-medium cursor-pointer">Indoor</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="outdoor" id="loc-outdoor" />
                    <label htmlFor="loc-outdoor" className="text-sm font-medium cursor-pointer">Outdoor</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="loc-both" />
                    <label htmlFor="loc-both" className="text-sm font-medium cursor-pointer">Both</label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold">Social Preference</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Do you prefer solo or group activities?
              </p>
              <RadioGroup
                value={preferences.preferredSocialAspect}
                onValueChange={(value) => setPreferences({ preferredSocialAspect: value as any })}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="solo" id="social-solo" />
                    <label htmlFor="social-solo" className="text-sm font-medium cursor-pointer">Solo</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="group" id="social-group" />
                    <label htmlFor="social-group" className="text-sm font-medium cursor-pointer">Group</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="social-both" />
                    <label htmlFor="social-both" className="text-sm font-medium cursor-pointer">Both</label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label className="text-base font-semibold">Budget</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              What's your budget for activity materials and resources?
            </p>
            <RadioGroup
              value={preferences.budget}
              onValueChange={(value) => setPreferences({ budget: value as any })}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="budget-free" />
                  <label htmlFor="budget-free" className="text-sm font-medium cursor-pointer">
                    Free - No cost activities only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="budget-low" />
                  <label htmlFor="budget-low" className="text-sm font-medium cursor-pointer">
                    Low - Under $20
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="budget-medium" />
                  <label htmlFor="budget-medium" className="text-sm font-medium cursor-pointer">
                    Medium - $20-$100
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="budget-high" />
                  <label htmlFor="budget-high" className="text-sm font-medium cursor-pointer">
                    High - $100+
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Additional Options */}
          <div>
            <Label className="text-base font-semibold">Additional Options</Label>
            <div className="mt-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-completed"
                  checked={preferences.skipCompleted}
                  onCheckedChange={(checked) => setPreferences({ skipCompleted: checked as boolean })}
                />
                <label htmlFor="skip-completed" className="text-sm font-medium cursor-pointer">
                  Skip activities I've already completed
                </label>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityPreferencesDialog;
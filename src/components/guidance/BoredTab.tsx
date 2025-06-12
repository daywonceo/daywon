
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, RefreshCw } from "lucide-react";
import ActivityFilters from "./ActivityFilters";
import ActivityCard from "./ActivityCard";
import ActivityStats from "./ActivityStats";

interface BoredTabProps {
  searchQuery: string;
}

const boredActivities = [
  {
    id: "walk",
    title: "Take a mindful walk",
    description: "Get some fresh air and light exercise while practicing mindfulness",
    duration: "10-15 mins",
    category: "Movement",
    type: "Solo",
    location: "Outdoor",
    mood: "stressed",
    energyLevel: "low",
    timeRange: "quick",
    emoji: "🚶"
  },
  {
    id: "call-friend",
    title: "Call a friend or family member",
    description: "Reconnect with someone you care about and share how you're doing",
    duration: "15-30 mins",
    category: "Social",
    type: "Social",
    location: "Indoor",
    mood: "lonely",
    energyLevel: "medium",
    timeRange: "short",
    emoji: "📞"
  },
  {
    id: "meditation",
    title: "Try a 5-minute meditation",
    description: "Center yourself with breathing exercises and mindfulness",
    duration: "5 mins",
    category: "Mindfulness",
    type: "Solo",
    location: "Indoor",
    mood: "stressed",
    energyLevel: "low",
    timeRange: "quick",
    emoji: "🧘"
  },
  {
    id: "organize",
    title: "Organize one small area",
    description: "Declutter your desk, drawer, or bookshelf for a sense of accomplishment",
    duration: "15 mins",
    category: "Productive",
    type: "Solo",
    location: "Indoor",
    mood: "productive",
    energyLevel: "medium",
    timeRange: "short",
    emoji: "📦"
  },
  {
    id: "learn",
    title: "Learn something new online",
    description: "Watch an educational video or read an interesting article",
    duration: "20 mins",
    category: "Learning",
    type: "Solo",
    location: "Indoor",
    mood: "creative",
    energyLevel: "medium",
    timeRange: "short",
    emoji: "📚"
  },
  {
    id: "exercise",
    title: "Do jumping jacks or push-ups",
    description: "Get your blood flowing with quick bodyweight exercises",
    duration: "5-10 mins",
    category: "Movement",
    type: "Solo",
    location: "Indoor",
    mood: "restless",
    energyLevel: "high",
    timeRange: "quick",
    emoji: "💪"
  },
  {
    id: "journal",
    title: "Write in a journal",
    description: "Reflect on your day, set intentions, or practice gratitude",
    duration: "10-15 mins",
    category: "Mindfulness",
    type: "Solo",
    location: "Indoor",
    mood: "stressed",
    energyLevel: "low",
    timeRange: "quick",
    emoji: "📝"
  },
  {
    id: "pet",
    title: "Play with a pet",
    description: "Spend quality time with your furry friend and enjoy their company",
    duration: "15 mins",
    category: "Fun",
    type: "Solo",
    location: "Indoor",
    mood: "lonely",
    energyLevel: "medium",
    timeRange: "short",
    emoji: "🐕"
  },
  {
    id: "stretch",
    title: "Do gentle stretching",
    description: "Release tension with simple stretches and improve flexibility",
    duration: "10 mins",
    category: "Movement",
    type: "Solo",
    location: "Indoor",
    mood: "stressed",
    energyLevel: "low",
    timeRange: "quick",
    emoji: "🤸"
  },
  {
    id: "cook",
    title: "Try a simple recipe",
    description: "Cook something delicious and enjoy the process of creating",
    duration: "30-45 mins",
    category: "Creative",
    type: "Solo",
    location: "Indoor",
    mood: "creative",
    energyLevel: "medium",
    timeRange: "medium",
    emoji: "👨‍🍳"
  },
  {
    id: "music",
    title: "Listen to uplifting music",
    description: "Put on your favorite songs and let the music boost your mood",
    duration: "15-20 mins",
    category: "Fun",
    type: "Solo",
    location: "Indoor",
    mood: "all",
    energyLevel: "all",
    timeRange: "short",
    emoji: "🎵"
  },
  {
    id: "creative",
    title: "Start a creative project",
    description: "Draw, paint, write, or craft something with your hands",
    duration: "30-60 mins",
    category: "Creative",
    type: "Solo",
    location: "Indoor",
    mood: "creative",
    energyLevel: "medium",
    timeRange: "medium",
    emoji: "🎨"
  }
];

const BoredTab = ({ searchQuery }: BoredTabProps) => {
  const [selectedMood, setSelectedMood] = useState("all");
  const [selectedEnergy, setSelectedEnergy] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [favoriteActivities, setFavoriteActivities] = useState<string[]>([]);
  const [randomActivity, setRandomActivity] = useState<string | null>(null);
  const [todayCompletions, setTodayCompletions] = useState<string[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const completed = localStorage.getItem('completed-activities');
    const favorites = localStorage.getItem('favorite-activities');
    const today = localStorage.getItem('today-completions');
    const todayDate = localStorage.getItem('completion-date');
    
    if (completed) setCompletedActivities(JSON.parse(completed));
    if (favorites) setFavoriteActivities(JSON.parse(favorites));
    
    // Reset today's completions if it's a new day
    const currentDate = new Date().toDateString();
    if (todayDate === currentDate && today) {
      setTodayCompletions(JSON.parse(today));
    } else {
      localStorage.setItem('completion-date', currentDate);
      localStorage.setItem('today-completions', JSON.stringify([]));
      setTodayCompletions([]);
    }
  }, []);

  const handleActivityComplete = (activityId: string) => {
    const newCompleted = [...completedActivities, activityId];
    const newTodayCompletions = [...todayCompletions, activityId];
    
    setCompletedActivities(newCompleted);
    setTodayCompletions(newTodayCompletions);
    
    localStorage.setItem('completed-activities', JSON.stringify(newCompleted));
    localStorage.setItem('today-completions', JSON.stringify(newTodayCompletions));
  };

  const handleActivityFavorite = (activityId: string) => {
    const newFavorites = favoriteActivities.includes(activityId)
      ? favoriteActivities.filter(id => id !== activityId)
      : [...favoriteActivities, activityId];
    
    setFavoriteActivities(newFavorites);
    localStorage.setItem('favorite-activities', JSON.stringify(newFavorites));
  };

  const getRandomActivity = () => {
    const available = filteredActivities.filter(activity => !completedActivities.includes(activity.id));
    if (available.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * available.length);
    const selected = available[randomIndex];
    setRandomActivity(selected.id);
    return selected;
  };

  const resetProgress = () => {
    setCompletedActivities([]);
    setTodayCompletions([]);
    setRandomActivity(null);
    localStorage.removeItem('completed-activities');
    localStorage.removeItem('today-completions');
  };

  const filteredActivities = boredActivities.filter(activity => {
    const matchesSearch = searchQuery === "" || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMood = selectedMood === "all" || activity.mood === selectedMood || activity.mood === "all";
    const matchesEnergy = selectedEnergy === "all" || activity.energyLevel === selectedEnergy || activity.energyLevel === "all";
    const matchesTime = selectedTime === "all" || activity.timeRange === selectedTime;
    
    return matchesSearch && matchesMood && matchesEnergy && matchesTime;
  });

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Beat boredom with purposeful activities tailored to your mood and energy
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button 
            onClick={getRandomActivity}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Surprise Me!
          </Button>
          
          <Button 
            onClick={resetProgress}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Progress
          </Button>
        </div>
      </div>

      <ActivityStats
        completedCount={completedActivities.length}
        totalActivities={boredActivities.length}
        favoriteCount={favoriteActivities.length}
        todayCount={todayCompletions.length}
      />

      <ActivityFilters
        selectedMood={selectedMood}
        selectedEnergy={selectedEnergy}
        selectedTime={selectedTime}
        onMoodChange={setSelectedMood}
        onEnergyChange={setSelectedEnergy}
        onTimeChange={setSelectedTime}
      />

      {/* Random Activity Highlight */}
      {randomActivity && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-center text-purple-700 dark:text-purple-400">
            🎲 Your Random Activity
          </h3>
          <div className="max-w-md mx-auto">
            {(() => {
              const activity = boredActivities.find(a => a.id === randomActivity);
              return activity ? (
                <ActivityCard
                  activity={activity}
                  isCompleted={completedActivities.includes(activity.id)}
                  onComplete={handleActivityComplete}
                  onFavorite={handleActivityFavorite}
                  isFavorite={favoriteActivities.includes(activity.id)}
                  isHighlighted={true}
                />
              ) : null;
            })()}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isCompleted={completedActivities.includes(activity.id)}
            onComplete={handleActivityComplete}
            onFavorite={handleActivityFavorite}
            isFavorite={favoriteActivities.includes(activity.id)}
            isHighlighted={randomActivity === activity.id}
          />
        ))}
      </div>

      {/* No Results Message */}
      {searchQuery && filteredActivities.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="p-6">
            <p className="text-center text-gray-600 dark:text-gray-300">
              No activities found for "{searchQuery}". Try adjusting your filters or search term.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BoredTab;

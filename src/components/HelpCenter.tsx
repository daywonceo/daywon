import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Book,
  Play,
  MessageCircle,
  Search,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'habits' | 'workouts' | 'social' | 'analytics' | 'account';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: string[];
  tips?: string[];
}

interface UserProgress {
  completedTopics: string[];
  currentTopic: string | null;
  onboardingComplete: boolean;
}

const helpTopics: HelpTopic[] = [
  {
    id: 'create-first-habit',
    title: 'Creating Your First Habit',
    description: 'Learn how to set up and track your first habit in DayWon',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: '5 minutes',
    steps: [
      'Navigate to the main dashboard',
      'Click the "+" button to add a new habit',
      'Choose a habit name and category',
      'Set your tracking frequency',
      'Save and start tracking!'
    ],
    tips: [
      'Start with small, achievable habits',
      'Choose habits you can do daily',
      'Be specific with your habit names'
    ]
  },
  {
    id: 'understanding-streaks',
    title: 'Understanding Streaks',
    description: 'Master the streak system to build lasting habits',
    category: 'habits',
    difficulty: 'beginner',
    estimatedTime: '3 minutes',
    steps: [
      'Complete a habit to start a streak',
      'Maintain consecutive days to grow your streak',
      'Use streak recovery if you miss a day',
      'Celebrate milestone achievements'
    ],
    tips: [
      'Focus on consistency over perfection',
      'Use the streak recovery feature wisely',
      'Share milestone achievements socially'
    ]
  },
  {
    id: 'workout-planning',
    title: 'Planning Your Workouts',
    description: 'Create and follow effective workout routines',
    category: 'workouts',
    difficulty: 'intermediate',
    estimatedTime: '10 minutes',
    steps: [
      'Go to the Guidance tab',
      'Select "Workouts" section',
      'Choose a workout plan or create custom',
      'Schedule your workout sessions',
      'Track progress and log exercises'
    ],
    tips: [
      'Start with beginner-friendly routines',
      'Schedule workouts at consistent times',
      'Log weights and reps for progress tracking'
    ]
  },
  {
    id: 'social-features',
    title: 'Connecting with Friends',
    description: 'Build a supportive community around your goals',
    category: 'social',
    difficulty: 'intermediate',
    estimatedTime: '8 minutes',
    steps: [
      'Visit the Social tab',
      'Find and add friends',
      'Share your progress and milestones',
      'Join or create challenges',
      'Support others with likes and comments'
    ],
    tips: [
      'Connect with friends who share similar goals',
      'Celebrate others\' achievements',
      'Join challenges to stay motivated'
    ]
  },
  {
    id: 'analytics-insights',
    title: 'Understanding Your Analytics',
    description: 'Use data insights to improve your habits',
    category: 'analytics',
    difficulty: 'advanced',
    estimatedTime: '12 minutes',
    steps: [
      'Access the Analytics dashboard',
      'Review your completion rates',
      'Analyze streak patterns',
      'Identify best performing habits',
      'Use insights to optimize your routine'
    ],
    tips: [
      'Check analytics weekly for trends',
      'Focus on habits with low completion rates',
      'Use best-day insights for scheduling'
    ]
  }
];

const faqs = [
  {
    question: 'How do I recover a broken streak?',
    answer: 'Use the streak recovery feature by clicking on the habit and selecting "Recover Streak". You can use this feature a limited number of times per month.'
  },
  {
    question: 'Can I edit or delete habits?',
    answer: 'Yes! Long-press on any habit to access edit options. You can modify the name, category, or archive habits you no longer need.'
  },
  {
    question: 'How do challenges work?',
    answer: 'Challenges are group activities where you compete or collaborate with friends. Join existing challenges or create your own with custom goals and durations.'
  },
  {
    question: 'What data can I export?',
    answer: 'You can export all your habit data, workout logs, social posts, and analytics in JSON or CSV format from the Settings page.'
  }
];

export const HelpCenter: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedTopics: [],
    currentTopic: null,
    onboardingComplete: false
  });

  useEffect(() => {
    loadUserProgress();
  }, [user]);

  const loadUserProgress = () => {
    const saved = localStorage.getItem(`help_progress_${user?.id}`);
    if (saved) {
      setUserProgress(JSON.parse(saved));
    }
  };

  const saveUserProgress = (progress: UserProgress) => {
    setUserProgress(progress);
    localStorage.setItem(`help_progress_${user?.id}`, JSON.stringify(progress));
  };

  const markTopicComplete = (topicId: string) => {
    const newProgress = {
      ...userProgress,
      completedTopics: [...userProgress.completedTopics, topicId],
      currentTopic: null
    };
    saveUserProgress(newProgress);
  };

  const startTopic = (topic: HelpTopic) => {
    setSelectedTopic(topic);
    const newProgress = {
      ...userProgress,
      currentTopic: topic.id
    };
    saveUserProgress(newProgress);
  };

  const filteredTopics = helpTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'habits', name: 'Habits' },
    { id: 'workouts', name: 'Workouts' },
    { id: 'social', name: 'Social' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'account', name: 'Account' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting-started': return <Play className="w-4 h-4" />;
      case 'habits': return <CheckCircle className="w-4 h-4" />;
      case 'workouts': return <Star className="w-4 h-4" />;
      case 'social': return <MessageCircle className="w-4 h-4" />;
      case 'analytics': return <Book className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  if (selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedTopic(null)}
                className="text-xs sm:text-sm -ml-2"
              >
                ← Back to Help Center
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
              {getCategoryIcon(selectedTopic.category)}
              {selectedTopic.title}
            </CardTitle>
            <CardDescription className="text-sm">{selectedTopic.description}</CardDescription>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
              <Badge className={`${getDifficultyColor(selectedTopic.difficulty)} text-xs`}>
                {selectedTopic.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectedTopic.estimatedTime}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            <div>
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Steps to Complete</h3>
              <div className="space-y-3">
                {selectedTopic.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-xs sm:text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedTopic.tips && (
              <div>
                <h3 className="font-semibold mb-3 text-sm sm:text-base">Pro Tips</h3>
                <div className="space-y-2">
                  {selectedTopic.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                onClick={() => markTopicComplete(selectedTopic.id)}
                disabled={userProgress.completedTopics.includes(selectedTopic.id)}
                className="w-full sm:w-auto text-sm"
              >
                {userProgress.completedTopics.includes(selectedTopic.id) ? (
                  <>
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </Button>
              <Button variant="outline" className="w-full sm:w-auto text-sm">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Need Help?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.history.back()}
          className="text-xs sm:text-sm"
        >
          ← Back
        </Button>
      </div>
      
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Help Center</h1>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Learn how to make the most of DayWon with step-by-step guides
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">Your Learning Progress</CardTitle>
          <CardDescription className="text-sm">
            Track your progress through DayWon tutorials and guides
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Completed Topics</span>
              <span>{userProgress.completedTopics.length}/{helpTopics.length}</span>
            </div>
            <Progress 
              value={(userProgress.completedTopics.length / helpTopics.length) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
          <Input
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 text-sm"
          />
        </div>
        
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-3 shrink-0"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Help Topics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredTopics.map((topic) => {
          const isCompleted = userProgress.completedTopics.includes(topic.id);
          const isCurrent = userProgress.currentTopic === topic.id;
          
          return (
            <Card 
              key={topic.id} 
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                isCurrent ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => startTopic(topic)}
            >
              <CardHeader className="pb-3 px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <div className="shrink-0">
                      {getCategoryIcon(topic.category)}
                    </div>
                    <CardTitle className="text-base sm:text-lg truncate">{topic.title}</CardTitle>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                  )}
                </div>
                <CardDescription className="text-xs sm:text-sm line-clamp-2">
                  {topic.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                    <Badge 
                      variant="secondary" 
                      className={`${getDifficultyColor(topic.difficulty)} text-[10px] sm:text-xs`}
                    >
                      {topic.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      {topic.estimatedTime}
                    </Badge>
                  </div>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          {faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex items-center justify-between cursor-pointer p-2.5 sm:p-3 border rounded-lg hover:bg-muted/50">
                <span className="font-medium text-sm sm:text-base pr-2">{faq.question}</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-open:rotate-90 shrink-0" />
              </summary>
              <div className="mt-2 p-2.5 sm:p-3 text-xs sm:text-sm text-muted-foreground border-l-2 border-muted ml-2 sm:ml-3">
                {faq.answer}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">Still Need Help?</CardTitle>
          <CardDescription className="text-sm">
            Can't find what you're looking for? Our support team is here to help.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button className="w-full sm:w-auto text-sm">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" className="w-full sm:w-auto text-sm">
              <Book className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Community Forum
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
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
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedTopic(null)}
              >
                ← Back to Help Center
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(selectedTopic.category)}
              {selectedTopic.title}
            </CardTitle>
            <CardDescription>{selectedTopic.description}</CardDescription>
            <div className="flex gap-2 mt-3">
              <Badge className={getDifficultyColor(selectedTopic.difficulty)}>
                {selectedTopic.difficulty}
              </Badge>
              <Badge variant="outline">
                {selectedTopic.estimatedTime}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Steps to Complete</h3>
              <div className="space-y-3">
                {selectedTopic.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedTopic.tips && (
              <div>
                <h3 className="font-semibold mb-3">Pro Tips</h3>
                <div className="space-y-2">
                  {selectedTopic.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={() => markTopicComplete(selectedTopic.id)}
                disabled={userProgress.completedTopics.includes(selectedTopic.id)}
              >
                {userProgress.completedTopics.includes(selectedTopic.id) ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </Button>
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Need Help?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground">
          Learn how to make the most of DayWon with step-by-step guides
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
          <CardDescription>
            Track your progress through DayWon tutorials and guides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
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
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Help Topics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(topic.category)}
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <CardDescription className="text-sm">
                  {topic.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge 
                      variant="secondary" 
                      className={getDifficultyColor(topic.difficulty)}
                    >
                      {topic.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {topic.estimatedTime}
                    </Badge>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-muted/50">
                <span className="font-medium">{faq.question}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="mt-2 p-3 text-sm text-muted-foreground border-l-2 border-muted ml-3">
                {faq.answer}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Our support team is here to help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button>
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline">
              <Book className="w-4 h-4 mr-2" />
              Community Forum
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
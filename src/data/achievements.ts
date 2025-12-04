import { Flame, Trophy, Target, Star, Zap, Heart, Crown, Medal, Rocket, Award } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: 'streak' | 'milestone' | 'social' | 'special';
  requirement: number;
  color: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Complete a 3-day streak',
    icon: Flame,
    category: 'streak',
    requirement: 3,
    color: 'text-orange-500',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete a 7-day streak',
    icon: Flame,
    category: 'streak',
    requirement: 7,
    color: 'text-orange-500',
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Complete a 14-day streak',
    icon: Flame,
    category: 'streak',
    requirement: 14,
    color: 'text-amber-500',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Complete a 30-day streak',
    icon: Flame,
    category: 'streak',
    requirement: 30,
    color: 'text-red-500',
  },
  {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Complete a 100-day streak',
    icon: Crown,
    category: 'streak',
    requirement: 100,
    color: 'text-yellow-500',
  },

  // Milestone achievements
  {
    id: 'habits_1',
    name: 'First Step',
    description: 'Create your first habit',
    icon: Star,
    category: 'milestone',
    requirement: 1,
    color: 'text-blue-500',
  },
  {
    id: 'habits_5',
    name: 'Habit Builder',
    description: 'Track 5 different habits',
    icon: Target,
    category: 'milestone',
    requirement: 5,
    color: 'text-blue-500',
  },
  {
    id: 'habits_10',
    name: 'Habit Master',
    description: 'Track 10 different habits',
    icon: Trophy,
    category: 'milestone',
    requirement: 10,
    color: 'text-purple-500',
  },
  {
    id: 'completions_50',
    name: 'Half Century',
    description: 'Complete 50 habit check-ins',
    icon: Zap,
    category: 'milestone',
    requirement: 50,
    color: 'text-green-500',
  },
  {
    id: 'completions_100',
    name: 'Centurion',
    description: 'Complete 100 habit check-ins',
    icon: Medal,
    category: 'milestone',
    requirement: 100,
    color: 'text-emerald-500',
  },
  {
    id: 'completions_500',
    name: 'Dedication',
    description: 'Complete 500 habit check-ins',
    icon: Award,
    category: 'milestone',
    requirement: 500,
    color: 'text-indigo-500',
  },

  // Social achievements
  {
    id: 'friends_1',
    name: 'Social Butterfly',
    description: 'Add your first friend',
    icon: Heart,
    category: 'social',
    requirement: 1,
    color: 'text-pink-500',
  },
  {
    id: 'friends_5',
    name: 'Growing Circle',
    description: 'Have 5 friends',
    icon: Heart,
    category: 'social',
    requirement: 5,
    color: 'text-rose-500',
  },

  // Special achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined Day Won early',
    icon: Rocket,
    category: 'special',
    requirement: 1,
    color: 'text-cyan-500',
  },
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

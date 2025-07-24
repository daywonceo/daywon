import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X, Trophy, Share2, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Milestone {
  id: string;
  percentage: number;
  title: string;
  description: string;
  icon: string;
}

interface ParticipantProgress {
  id: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface MilestoneNotificationProps {
  participant: ParticipantProgress;
  milestone: Milestone;
  challengeTitle: string;
  onClose: () => void;
  onShare?: () => void;
  onCelebrate?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const MilestoneNotification = ({
  participant,
  milestone,
  challengeTitle,
  onClose,
  onShare,
  onCelebrate,
  autoClose = true,
  duration = 8000,
}: MilestoneNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const displayName = participant.profiles?.display_name || participant.profiles?.email || 'Someone';

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Trigger confetti for major milestones
    if (milestone.percentage >= 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'],
      });
    } else if (milestone.percentage >= 50) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#4ECDC4', '#45B7D1', '#96CEB4'],
      });
    }

    // Auto close
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, milestone.percentage]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleCelebrate = () => {
    setIsCelebrating(true);
    
    // Trigger celebration confetti
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF69B4'],
    });

    setTimeout(() => setIsCelebrating(false), 1000);
    
    if (onCelebrate) {
      onCelebrate();
    }
  };

  const getMilestoneColor = () => {
    if (milestone.percentage >= 100) return 'from-yellow-400 via-orange-400 to-red-400';
    if (milestone.percentage >= 75) return 'from-purple-400 via-pink-400 to-red-400';
    if (milestone.percentage >= 50) return 'from-blue-400 via-purple-400 to-pink-400';
    return 'from-green-400 via-blue-400 to-purple-400';
  };

  const getPulseColor = () => {
    if (milestone.percentage >= 100) return 'shadow-yellow-400/50';
    if (milestone.percentage >= 75) return 'shadow-purple-400/50';
    if (milestone.percentage >= 50) return 'shadow-blue-400/50';
    return 'shadow-green-400/50';
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
      style={{ maxWidth: '320px' }}
    >
      <Card className={`bg-white dark:bg-gray-800 border-2 shadow-2xl ${getPulseColor()} animate-pulse-shadow`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                Milestone Achieved!
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Milestone Content */}
          <div className="text-center mb-4">
            <div 
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getMilestoneColor()} mb-3 animate-bounce`}
            >
              <span className="text-3xl">{milestone.icon}</span>
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
              {milestone.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {milestone.description}
            </p>

            <Badge 
              className={`bg-gradient-to-r ${getMilestoneColor()} text-white border-0 font-semibold`}
            >
              {milestone.percentage}% Complete
            </Badge>
          </div>

          {/* Participant Info */}
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={participant.profiles?.avatar_url || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                in {challengeTitle}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleCelebrate}
              disabled={isCelebrating}
              className={`flex-1 bg-gradient-to-r ${getMilestoneColor()} hover:opacity-90 text-white border-0 transition-all duration-200 ${
                isCelebrating ? 'animate-pulse scale-95' : 'hover:scale-105'
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isCelebrating ? 'animate-ping' : ''}`} />
              {isCelebrating ? 'Celebrating!' : 'Celebrate'}
            </Button>
            
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MilestoneNotification;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart, Users } from 'lucide-react';
import ChallengeComments from './ChallengeComments';
import ChallengeReactions from './ChallengeReactions';
import { useChallengeComments } from '@/hooks/useChallengeComments';
import { useChallengeReactions } from '@/hooks/useChallengeReactions';

interface ChallengeInteractionsProps {
  challengeId: string;
  showTeamChat?: boolean;
  className?: string;
}

const ChallengeInteractions = ({ 
  challengeId, 
  showTeamChat = false, 
  className = "" 
}: ChallengeInteractionsProps) => {
  const { comments } = useChallengeComments(challengeId);
  const { getTotalReactions } = useChallengeReactions(challengeId);

  const totalComments = comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0);
  const totalReactions = getTotalReactions();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Reactions Bar */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart size={16} className="text-red-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
                </span>
              </div>
            </div>
            
            <ChallengeReactions challengeId={challengeId} compact />
          </div>
        </CardContent>
      </Card>

      {/* Interaction Tabs */}
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="comments" className="flex items-center space-x-2">
            <MessageCircle size={16} />
            <span>Comments</span>
            {totalComments > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalComments}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reactions" className="flex items-center space-x-2">
            <Heart size={16} />
            <span>Reactions</span>
            {totalReactions > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalReactions}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="mt-4">
          <ChallengeComments challengeId={challengeId} />
        </TabsContent>

        <TabsContent value="reactions" className="mt-4">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Heart size={20} className="text-red-500" />
                <span>Reactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ChallengeReactions challengeId={challengeId} />
                
                {totalReactions === 0 && (
                  <div className="text-center py-8">
                    <Heart className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No reactions yet. Be the first to react to this challenge!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengeInteractions;
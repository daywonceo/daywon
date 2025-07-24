import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Plus, Settings } from 'lucide-react';
import ChallengeCard from './ChallengeCard';
import CreateChallengeModal from './CreateChallengeModal';
import ChallengeManager from './ChallengeManager';
import { useChallenges } from '@/hooks/useChallenges';

const Groups = () => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'manage' | 'teams'>('challenges');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { challenges, loading, joinChallenge, leaveChallenge, refreshChallenges } = useChallenges();

  const handleViewDetails = (challengeId: string) => {
    // TODO: Implement challenge details modal/page
    console.log('View challenge details:', challengeId);
  };

  const handleCreateSuccess = () => {
    refreshChallenges();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
          <Trophy className="text-purple-600 dark:text-purple-400" size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Group Challenges
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Join challenges, form teams, and achieve goals together
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1">
          {(['challenges', 'manage', 'teams'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab === 'challenges' && <Trophy size={16} className="mr-1" />}
              {tab === 'manage' && <Settings size={16} className="mr-1" />}
              {tab === 'teams' && <Users size={16} className="mr-1" />}
              {tab}
            </Button>
          ))}
        </div>
        
        <Button 
          size="sm" 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} className="mr-1" />
          Create
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Loading challenges...</p>
            </div>
          ) : challenges.length === 0 ? (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Active Challenges</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Be the first to create a challenge for your community!
                </p>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={16} className="mr-1" />
                  Create Challenge
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoin={joinChallenge}
                  onLeave={leaveChallenge}
                  onViewDetails={handleViewDetails}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <ChallengeManager />
      )}

      {activeTab === 'teams' && (
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Teams Coming Soon</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Team management and formation features will be available soon!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Groups;
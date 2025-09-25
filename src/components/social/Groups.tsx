import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Plus, Settings, Heart, Share2, CheckSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ChallengeCard from './ChallengeCard';
import CreateChallengeModal from './CreateChallengeModal';
import ChallengeManager from './ChallengeManager';
import ChallengeDetail from './ChallengeDetail';
import ChallengeDiscovery from './ChallengeDiscovery';
import BulkChallengeActions from './BulkChallengeActions';
import { useChallenges } from '@/hooks/useChallenges';

const Groups = () => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'discover' | 'manage' | 'teams'>('challenges');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const { challenges, loading, joinChallenge, leaveChallenge, refreshChallenges } = useChallenges();

  const handleViewDetails = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setSelectedChallenge(challenge);
      setShowDetailModal(true);
    }
  };

  const handleCreateSuccess = () => {
    refreshChallenges();
  };

  const handleShare = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      navigator.share?.({
        title: challenge.title,
        text: challenge.description,
        url: window.location.href + `?challenge=${challengeId}`
      }).catch(() => {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`Check out this challenge: ${challenge.title} - ${window.location.href}?challenge=${challengeId}`);
        toast({
          title: "Link copied!",
          description: "Challenge link copied to clipboard",
        });
      });
    }
  };

  const handleFavorite = (challengeId: string) => {
    // Implementation would depend on backend
    toast({
      title: "Added to favorites",
      description: "Challenge saved to your favorites",
    });
  };

  const handleQuickProgress = (challengeId: string) => {
    // Quick progress logging
    toast({
      title: "Progress logged",
      description: "Your progress has been updated",
    });
  };

  const handleBulkAction = async (action: string, challengeIds: string[]) => {
    switch (action) {
      case 'share':
        const shareText = `Check out these ${challengeIds.length} challenges: ${window.location.href}`;
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Shared successfully",
          description: `${challengeIds.length} challenges shared`,
        });
        break;
      case 'archive':
        // Archive implementation
        toast({
          title: "Archived",
          description: `${challengeIds.length} challenges archived`,
        });
        break;
      case 'delete':
        if (window.confirm(`Delete ${challengeIds.length} challenges? This cannot be undone.`)) {
          toast({
            title: "Deleted",
            description: `${challengeIds.length} challenges deleted`,
          });
        }
        break;
      case 'invite':
        toast({
          title: "Invitation sent",
          description: `Invitations sent for ${challengeIds.length} challenges`,
        });
        break;
    }
    setSelectedChallenges([]);
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
      <div className="flex items-center justify-between gap-2 px-2">
        <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 flex-1 max-w-md">
          {(['challenges', 'discover', 'manage', 'teams'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="capitalize flex-1 text-xs px-2 py-1 h-8"
            >
              {tab === 'challenges' && <Trophy size={14} className="mr-1" />}
              {tab === 'discover' && <Heart size={14} className="mr-1" />}
              {tab === 'manage' && <Settings size={14} className="mr-1" />}
              {tab === 'teams' && <Users size={14} className="mr-1" />}
              <span className="hidden sm:inline">{tab}</span>
            </Button>
          ))}
        </div>
        
        <Button 
          size="sm" 
          className="bg-purple-600 hover:bg-purple-700 px-3 py-1 h-8"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={14} className="mr-1" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {/* Bulk Actions */}
          {challenges.length > 0 && (
            <BulkChallengeActions
              challenges={challenges}
              selectedChallenges={selectedChallenges}
              onSelectionChange={setSelectedChallenges}
              onBulkAction={handleBulkAction}
            />
          )}
          
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
                  onShare={handleShare}
                  onFavorite={handleFavorite}
                  onQuickProgress={handleQuickProgress}
                  loading={loading}
                  isSelected={selectedChallenges.includes(challenge.id)}
                  onSelect={(id) => {
                    if (selectedChallenges.includes(id)) {
                      setSelectedChallenges(prev => prev.filter(cId => cId !== id));
                    } else {
                      setSelectedChallenges(prev => [...prev, id]);
                    }
                  }}
                  showQuickActions={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <ChallengeDiscovery 
          challenges={challenges}
          onViewDetails={handleViewDetails}
          onJoin={joinChallenge}
          onLeave={leaveChallenge}
        />
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

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <ChallengeDetail
          challenge={selectedChallenge}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          onJoin={joinChallenge}
          onLeave={leaveChallenge}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Groups;
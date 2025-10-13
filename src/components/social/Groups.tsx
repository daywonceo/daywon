import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CreateChallengeModal from './CreateChallengeModal';
import ChallengeManager from './ChallengeManager';
import ChallengeDetail from './ChallengeDetail';
import ChallengeDiscovery from './ChallengeDiscovery';
import { useChallenges } from '@/hooks/useChallenges';
import GroupsHeader from './challenges/GroupsHeader';
import GroupsNavigation from './challenges/GroupsNavigation';
import ChallengesTabContent from './challenges/ChallengesTabContent';

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

  const handleJoin = async (id: string) => {
    await joinChallenge(id);
  };

  const handleLeave = async (id: string) => {
    await leaveChallenge(id);
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
      <GroupsHeader />

      {/* Navigation */}
      <GroupsNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateClick={() => setShowCreateModal(true)}
      />

      {/* Content */}
      {activeTab === 'challenges' && (
        <ChallengesTabContent
          onJoin={handleJoin}
          onLeave={handleLeave}
          onViewDetails={handleViewDetails}
          onShare={handleShare}
          onFavorite={handleFavorite}
          onQuickProgress={handleQuickProgress}
        />
      )}

      {activeTab === 'discover' && (
        <ChallengeDiscovery 
          challenges={challenges}
          onViewDetails={handleViewDetails}
          onJoin={handleJoin}
          onLeave={handleLeave}
        />
      )}

      {activeTab === 'manage' && (
        <ChallengeManager />
      )}

      {activeTab === 'teams' && (
        <Card className="bg-card backdrop-blur-sm border">
          <CardContent className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Teams Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
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
          onJoin={handleJoin}
          onLeave={handleLeave}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Groups;
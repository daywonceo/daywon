import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Trophy, Target, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'community' | 'challenge';
  data: {
    id: number;
    name?: string;
    title?: string;
    description?: string;
    category?: string;
    habit?: string;
    duration?: string;
    members?: any[];
    participants?: any[];
    timeRemaining?: string;
  } | null;
  currentUser?: any;
  onJoin: (id: number) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  type,
  data,
  currentUser,
  onJoin
}) => {
  const { toast } = useToast();
  
  // Early return if no data
  if (!data) {
    return null;
  }
  
  const displayName = type === 'community' ? data.name : data.title;
  const memberCount = type === 'community' ? data.members?.length : data.participants?.length;

  const handleJoin = () => {
    if (!currentUser) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to join this " + type,
        variant: "destructive"
      });
      // In a real app, redirect to login
      return;
    }
    
    onJoin(data.id);
    onClose();
  };

  const getIcon = () => {
    if (type === 'community') {
      return <Users className="text-green-600 dark:text-green-400" size={20} />;
    }
    return <Trophy className="text-purple-600 dark:text-purple-400" size={20} />;
  };

  const getFriendlyMessage = () => {
    const messages = [
      "Your friend thinks you'd love this " + type + " — want to join in?",
      "Looks like someone wants you in their crew. Tap below to jump in!",
      "Someone special invited you to be part of something great!",
      "Ready to grow together? Your friend is waiting!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>Join {type === 'community' ? 'Community' : 'Challenge'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Friendly Message */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <Heart className="mx-auto mb-2 text-pink-500" size={24} />
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {getFriendlyMessage()}
              </p>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        {displayName}
                      </h4>
                      {data.category && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {data.category}
                        </Badge>
                      )}
                    </div>
                    {data.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {data.description}
                      </p>
                    )}
                    {type === 'challenge' && data.habit && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {data.habit} • {data.duration}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    {type === 'community' ? <Users size={14} /> : <Trophy size={14} />}
                    <span>
                      {memberCount} {type === 'community' ? 'members' : 'participants'}
                    </span>
                  </div>
                  {type === 'challenge' && data.timeRemaining && (
                    <div className="flex items-center space-x-1">
                      <Target size={14} />
                      <span>{data.timeRemaining}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleJoin}
              className="flex-1"
              size="lg"
            >
              Join {type === 'community' ? 'Community' : 'Challenge'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              size="lg"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
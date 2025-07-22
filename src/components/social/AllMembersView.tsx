import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import MemberCard from "./MemberCard";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  name: string;
  avatar: string;
  initials: string;
  topHabits: string[];
  streak: number;
}

interface AllMembersViewProps {
  title: string;
  members: User[];
  onBack: () => void;
  currentUserId?: number;
}

const AllMembersView: React.FC<AllMembersViewProps> = ({
  title,
  members,
  onBack,
  currentUserId = 1
}) => {
  const { toast } = useToast();

  const handleMemberMessage = (memberId: number) => {
    toast({
      title: "Message Sent!",
      description: "Your message has been delivered.",
    });
  };

  // Sort members by streak (longest first)
  const sortedMembers = [...members].sort((a, b) => b.streak - a.streak);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Users size={16} />
            <span>{members.length} members</span>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {sortedMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            currentUserId={currentUserId}
            showInviteButton={false}
            onMessage={handleMemberMessage}
          />
        ))}
      </div>
    </div>
  );
};

export default AllMembersView;
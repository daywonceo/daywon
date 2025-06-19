
import React from "react";
import { Calendar } from "lucide-react";

interface MembershipMilestoneProps {
  daysActive: number;
}

const MembershipMilestone = ({ daysActive }: MembershipMilestoneProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <Calendar className="w-5 h-5 text-purple-600 mr-2" />
        <h3 className="text-lg font-bold">Membership</h3>
      </div>
      
      <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg p-6 text-center border border-green-200 dark:border-green-800">
        <h3 className="font-bold mb-2 text-gray-700 dark:text-gray-300">Member Since Day One</h3>
        <p className="text-2xl font-bold tracking-wider mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          {daysActive} DAYS STRONG!
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Keep up the amazing consistency!
        </p>
      </div>
    </div>
  );
};

export default MembershipMilestone;

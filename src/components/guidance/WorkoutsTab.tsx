
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NewWorkoutsTab from "./NewWorkoutsTab";

interface WorkoutsTabProps {
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  searchQuery: string;
}

const WorkoutsTab = ({ selectedDifficulty, onDifficultyChange, searchQuery }: WorkoutsTabProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <Card className="bg-white dark:bg-gray-800 mx-4">
        <CardContent className="p-8 text-center">
          <LogIn className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Login Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access your personalized workout plans and track your progress.
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-green-600 hover:bg-green-700"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In / Sign Up
          </Button>
        </CardContent>
      </Card>
    );
  }

  // User is authenticated, show the workout features
  return <NewWorkoutsTab />;
};

export default WorkoutsTab;

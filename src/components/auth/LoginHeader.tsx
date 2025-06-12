
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";

interface LoginHeaderProps {
  isSignUp: boolean;
  showForgotPassword: boolean;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ isSignUp, showForgotPassword }) => {
  const getTitle = () => {
    if (showForgotPassword) return "Reset Password";
    return isSignUp ? "Create Account" : "Welcome";
  };

  const getSubtitle = () => {
    if (showForgotPassword) return "Enter your email to receive reset instructions";
    return isSignUp 
      ? "Join us to start your habit tracking journey" 
      : "Sign in to continue your habit journey";
  };

  return (
    <CardHeader className="text-center pb-4">
      <div className="flex justify-center mb-4">
        <div className="relative">
          {isSignUp ? (
            <UserPlus className="w-16 h-16 text-blue-500" />
          ) : (
            <LogIn className="w-16 h-16 text-green-500" />
          )}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-ping" />
        </div>
      </div>
      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
        {getTitle()}
      </CardTitle>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        {getSubtitle()}
      </p>
    </CardHeader>
  );
};

export default LoginHeader;

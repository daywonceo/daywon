
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import dayWonLogo from "@/assets/day-won-logo.png";

interface LoginHeaderProps {
  isSignUp: boolean;
  showForgotPassword: boolean;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ isSignUp, showForgotPassword }) => {
  const getTitle = () => {
    if (showForgotPassword) return "Reset Password";
    return isSignUp ? "Join Day Won" : "Welcome Back";
  };

  const getSubtitle = () => {
    if (showForgotPassword) return "Enter your email to receive reset instructions";
    return isSignUp 
      ? "Start building habits that stick" 
      : "Continue your winning streak";
  };

  return (
    <CardHeader className="text-center pb-4">
      <div className="flex justify-center mb-2">
        <img 
          src={dayWonLogo} 
          alt="Day Won" 
          className="h-24 sm:h-28 w-auto"
        />
      </div>
      <CardTitle className="text-2xl sm:text-3xl font-bold text-gradient-primary">
        {getTitle()}
      </CardTitle>
      <p className="text-muted-foreground mt-1 text-sm sm:text-base">
        {getSubtitle()}
      </p>
    </CardHeader>
  );
};

export default LoginHeader;

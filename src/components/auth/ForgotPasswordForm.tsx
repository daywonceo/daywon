
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: () => Promise<void>;
  onBackToSignIn: () => void;
  errors: { [key: string]: string };
  isLoading: boolean;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  email,
  setEmail,
  onSubmit,
  onBackToSignIn,
  errors,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "pl-10",
              errors.email && "border-red-500 focus-visible:ring-red-500"
            )}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="space-y-3">
        <Button 
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          {isLoading ? "Sending..." : "Send Reset Email"}
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={onBackToSignIn}
          className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Back to sign in
        </Button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

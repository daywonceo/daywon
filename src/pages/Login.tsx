
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import LoginForm from "@/components/auth/LoginForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import LoginHeader from "@/components/auth/LoginHeader";
import { useLoginLogic } from "@/hooks/useLoginLogic";

const Login = () => {
  const {
    isSignUp,
    showForgotPassword,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    errors,
    isLoading,
    handleSubmit,
    handleGoogleSignIn,
    toggleMode,
    toggleForgotPassword
  } = useLoginLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border border-border/50 shadow-2xl bg-card/95 backdrop-blur-md">
          <LoginHeader isSignUp={isSignUp} showForgotPassword={showForgotPassword} />
          
          <CardContent className="space-y-6">
            {/* Social Login Buttons - Hide during forgot password */}
            {!showForgotPassword && (
              <>
                <SocialLoginButtons 
                  onGoogleSignIn={handleGoogleSignIn}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Form Content */}
            {showForgotPassword ? (
              <ForgotPasswordForm
                email={email}
                setEmail={setEmail}
                onSubmit={handleSubmit}
                onBackToSignIn={toggleForgotPassword}
                errors={errors}
                isLoading={isLoading}
              />
            ) : (
              <LoginForm
                isSignUp={isSignUp}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                onSubmit={handleSubmit}
                onToggleMode={toggleMode}
                onToggleForgotPassword={toggleForgotPassword}
                errors={errors}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import LoginForm from "@/components/auth/LoginForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signIn, signInWithGoogle, signInWithApple, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!showForgotPassword) {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (isSignUp && password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (isSignUp) {
        if (!confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    if (showForgotPassword) {
      const { error } = await resetPassword(email);
      if (error) {
        console.error("Password reset error:", error);
        toast.error("Failed to send reset email: " + error.message);
      } else {
        toast.success("Password reset email sent! Please check your inbox.");
        setShowForgotPassword(false);
      }
    } else if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        console.error("Sign up error:", error);
        if (error.message.includes("User already registered")) {
          setErrors({ email: "An account with this email already exists" });
        } else {
          toast.error("Sign up failed: " + error.message);
        }
      } else {
        toast.success("Account created successfully! Please check your email to verify your account.");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        console.error("Sign in error:", error);
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error("Sign in failed: " + error.message);
        }
      } else {
        toast.success("Welcome back!");
        navigate('/');
      }
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      console.error("Google sign in error:", error);
      toast.error("Google sign in failed: " + error.message);
    }
  };

  const handleAppleSignIn = async () => {
    const { error } = await signInWithApple();
    if (error) {
      console.error("Apple sign in error:", error);
      toast.error("Apple sign in failed: " + error.message);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setShowForgotPassword(false);
    setErrors({});
    setPassword("");
    setConfirmPassword("");
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setIsSignUp(false);
    setErrors({});
    setPassword("");
    setConfirmPassword("");
  };

  const getTitle = () => {
    if (showForgotPassword) return "Reset Password";
    return isSignUp ? "Create Account" : "Welcome Back";
  };

  const getSubtitle = () => {
    if (showForgotPassword) return "Enter your email to receive reset instructions";
    return isSignUp 
      ? "Join us to start your habit tracking journey" 
      : "Sign in to continue your habit journey";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
          
          <CardContent className="space-y-6">
            {/* Social Login Buttons - Hide during forgot password */}
            {!showForgotPassword && (
              <>
                <SocialLoginButtons 
                  onGoogleSignIn={handleGoogleSignIn}
                  onAppleSignIn={handleAppleSignIn}
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

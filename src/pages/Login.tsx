
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Eye, EyeOff, Mail, Lock, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
              <div className="space-y-3">
                <Button 
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full py-3 rounded-full border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                
                <Button 
                  onClick={handleAppleSignIn}
                  variant="outline"
                  className="w-full py-3 rounded-full border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </Button>
              </div>
            )}

            {!showForgotPassword && (
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
            )}

            <div className="space-y-4">
              {/* Email Field */}
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

              {/* Password Field - Hide during forgot password */}
              {!showForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={isSignUp ? "Create a password" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        "pl-10 pr-10",
                        errors.password && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
              )}

              {/* Confirm Password Field - Only for Sign Up */}
              {isSignUp && !showForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(
                        "pl-10 pr-10",
                        errors.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isLoading 
                  ? (showForgotPassword ? "Sending..." : (isSignUp ? "Creating Account..." : "Signing In...")) 
                  : (showForgotPassword ? "Send Reset Email" : (isSignUp ? "Create Account" : "Sign In"))
                }
              </Button>
              
              {!showForgotPassword && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={toggleMode}
                    className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {isSignUp 
                      ? "Already have an account? Sign in" 
                      : "Don't have an account? Sign up"
                    }
                  </Button>
                  
                  {!isSignUp && (
                    <Button 
                      variant="ghost" 
                      onClick={toggleForgotPassword}
                      className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                    >
                      Forgot your password?
                    </Button>
                  )}
                </>
              )}
              
              {showForgotPassword && (
                <Button 
                  variant="ghost" 
                  onClick={toggleForgotPassword}
                  className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Back to sign in
                </Button>
              )}
            </div>

            {isSignUp && !showForgotPassword && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

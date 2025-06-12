
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useLoginLogic = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signIn, signInWithGoogle, signInWithApple, signInWithSpotify, resetPassword, user } = useAuth();
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
        toast.success("Welcome!");
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

  const handleSpotifySignIn = async () => {
    const { error } = await signInWithSpotify();
    if (error) {
      console.error("Spotify sign in error:", error);
      toast.error("Spotify sign in failed: " + error.message);
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

  return {
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
    handleAppleSignIn,
    handleSpotifySignIn,
    toggleMode,
    toggleForgotPassword
  };
};

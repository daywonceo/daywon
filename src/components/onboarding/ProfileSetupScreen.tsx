import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface ProfileSetupData {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
}

interface ProfileSetupScreenProps {
  onComplete: (data: ProfileSetupData) => void;
  onBack?: () => void;
  initialData?: Partial<ProfileSetupData>;
}

export default function ProfileSetupScreen({ 
  onComplete, 
  onBack,
  initialData 
}: ProfileSetupScreenProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState(initialData?.username || "");
  const [displayName, setDisplayName] = useState(initialData?.displayName || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateUsername = async (value: string) => {
    if (!value) {
      setUsernameError("Username is required");
      return false;
    }

    if (value.length < 3 || value.length > 30) {
      setUsernameError("Username must be 3-30 characters");
      return false;
    }

    if (!/^[a-z0-9._]+$/.test(value)) {
      setUsernameError("Username can only contain letters, numbers, dots, and underscores");
      return false;
    }

    if (value.startsWith('.') || value.startsWith('_') || value.endsWith('.') || value.endsWith('_')) {
      setUsernameError("Username cannot start or end with dots or underscores");
      return false;
    }

    setIsValidatingUsername(true);
    try {
      const { data, error } = await supabase.rpc('check_username_availability', {
        username_input: value
      });

      if (error) throw error;

      if (!data.valid) {
        setUsernameError(data.message || "Username is not available");
        return false;
      }

      setUsernameError("");
      return true;
    } catch (error) {
      console.error('Error validating username:', error);
      setUsernameError("Error validating username");
      return false;
    } finally {
      setIsValidatingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const lowercased = value.toLowerCase();
    setUsername(lowercased);
    
    // Clear error when typing
    if (usernameError) {
      setUsernameError("");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = async () => {
    if (!username || !displayName) {
      toast({
        title: "Missing information",
        description: "Please fill in username and display name",
        variant: "destructive"
      });
      return;
    }

    // Validate username before continuing
    const isValid = await validateUsername(username);
    if (!isValid) return;

    onComplete({
      username,
      displayName,
      bio,
      avatarUrl
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 pb-20">
      <Card className="glass-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-gradient-primary">
            Set up your profile
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Complete your profile to personalize your experience
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {displayName?.charAt(0)?.toUpperCase() || username?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Click the camera icon to upload a profile picture
            </p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              onBlur={() => username && validateUsername(username)}
              placeholder="your_username"
              maxLength={30}
              className={usernameError ? "border-destructive" : ""}
            />
            {isValidatingUsername && (
              <p className="text-xs text-muted-foreground">Checking availability...</p>
            )}
            {usernameError && (
              <p className="text-xs text-destructive">{usernameError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              3-30 characters. Letters, numbers, dots, and underscores only.
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              This is how others will see your name
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/160
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-background/95 backdrop-blur border-t">
        <div className="w-full max-w-lg mx-auto space-y-2">
          <Button
            onClick={handleContinue}
            disabled={!username || !displayName || isValidatingUsername || !!usernameError}
            className="w-full gradient-primary text-primary-foreground py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            Continue
          </Button>
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full"
              size="lg"
            >
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

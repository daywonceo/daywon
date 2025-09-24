import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSocialProfiles } from '@/hooks/useSocialProfiles';
import { useUsernameValidation } from '@/hooks/useUsernameValidation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Camera, Check, X, Loader2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileProfileEditorProps {
  onCancel: () => void;
  onSave?: () => void;
}

export const MobileProfileEditor = ({ onCancel, onSave }: MobileProfileEditorProps) => {
  const { currentUserProfile, updateProfile } = useSocialProfiles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [displayName, setDisplayName] = useState(currentUserProfile?.display_name || '');
  const [bio, setBio] = useState(currentUserProfile?.bio || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Username validation
  const {
    username,
    setUsername,
    isChecking,
    isAvailable,
    error: usernameError,
    errorCode,
    suggestions
  } = useUsernameValidation(displayName, currentUserProfile?.username);

  // Initialize form with current profile data
  useEffect(() => {
    if (currentUserProfile) {
      setDisplayName(currentUserProfile.display_name || '');
      setBio(currentUserProfile.bio || '');
      if (currentUserProfile.username) {
        setUsername(currentUserProfile.username);
      }
    }
  }, [currentUserProfile, setUsername]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${currentUserProfile?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    // Validate display name
    if (!displayName.trim()) {
      toast({
        title: "Display name required",
        description: "Please enter a display name",
        variant: "destructive",
      });
      return;
    }

    if (displayName.length > 40) {
      toast({
        title: "Display name too long",
        description: "Display name must be 40 characters or less",
        variant: "destructive",
      });
      return;
    }

    // Check username availability only if username has actually changed
    const hasUsernameChanged = username !== currentUserProfile?.username;
    if (hasUsernameChanged && (isAvailable === false || usernameError)) {
      toast({
        title: "Username not available",
        description: usernameError || "This username is not available. Please choose another one.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updates: any = {};
      
      if (displayName.trim() !== currentUserProfile?.display_name) {
        updates.display_name = displayName.trim();
      }
      
      if (bio.trim() !== currentUserProfile?.bio) {
        updates.bio = bio.trim() || null;
      }

      // Handle username update with enhanced validation
      const needsUsernameUpdate = username && username !== currentUserProfile?.username;
      if (needsUsernameUpdate && currentUserProfile?.id) {
        const { data, error: rpcError } = await supabase.rpc('update_username_enhanced', {
          user_id: currentUserProfile.id,
          new_username: username
        });

        if (rpcError) {
          toast({
            title: "Username update failed",
            description: "Failed to update username. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const result = data as { success?: boolean; error?: string; message?: string };
        if (!result.success) {
          toast({
            title: "Username update failed", 
            description: result.message || "Failed to update username.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Update other profile fields if changed
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      onSave?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getUsernameStatusIcon = () => {
    if (isChecking) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (usernameError) {
      if (errorCode === 'USERNAME_RATE_LIMIT') return <Clock className="w-4 h-4 text-orange-500" />;
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (isAvailable === true && username) return <Check className="w-4 h-4 text-green-500" />;
    if (isAvailable === false) return <X className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getUsernameStatusText = () => {
    if (isChecking) return "Checking availability...";
    if (usernameError) {
      if (errorCode === 'USERNAME_TAKEN') return "That username is taken. Try a variation.";
      if (errorCode === 'USERNAME_INVALID') return "Only letters, numbers, dots, and underscores. No separators at the start/end.";
      if (errorCode === 'USERNAME_RESERVED') return "That name is reserved.";
      if (errorCode === 'USERNAME_RATE_LIMIT') {
        // Extract date from error message if available
        const match = usernameError.match(/(\d{4}-\d{2}-\d{2})/);
        const date = match ? new Date(match[1]).toLocaleDateString() : "later";
        return `You changed your username recently. Try again on ${date}.`;
      }
      if (errorCode === 'USERNAME_PROFANE') return "That name is reserved."; // Treat profanity as reserved
      return usernameError; // Fallback to original error
    }
    if (isAvailable === true && username) return "Looks good — available.";
    return "";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b px-6 py-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarImage 
                src={currentUserProfile?.avatar_url || "/placeholder.svg"} 
                alt="Profile"
              />
              <AvatarFallback className="text-lg font-bold">
                {(displayName || currentUserProfile?.display_name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-md min-h-[44px] min-w-[44px]"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              aria-label="Change profile picture"
            >
              {avatarUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground truncate">
              {displayName || currentUserProfile?.display_name || 'User'}
            </h1>
            <p className="text-sm text-muted-foreground">
              @{username || currentUserProfile?.username || 'username'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-6 py-6 space-y-6">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display-name" className="text-sm font-medium">
            Display Name
          </Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            maxLength={40}
            className={cn(
              "text-base min-h-[44px]",
              displayName.length > 40 ? "border-red-500" : ""
            )}
            aria-describedby="display-name-help"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span id="display-name-help">Unicode characters allowed</span>
            <span className={displayName.length > 40 ? "text-red-500" : ""}>
              {displayName.length}/40
            </span>
          </div>
        </div>

        {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className={cn(
                  "text-base min-h-[44px] pr-10",
                  isAvailable === false || usernameError ? "border-red-500" : "",
                  isAvailable === true ? "border-green-500" : ""
                )}
                aria-describedby="username-help username-status"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {getUsernameStatusIcon()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                <span id="username-help">
                  Usernames are unique. 3–30 characters: letters, numbers, dot, underscore.
                </span>
              </div>
              {(isChecking || usernameError || isAvailable !== null) && (
                <p 
                  id="username-status"
                  className={cn(
                    "text-sm",
                    isChecking ? "text-blue-500" : "",
                    usernameError ? "text-red-500" : "",
                    isAvailable === true ? "text-green-500" : ""
                  )}
                  aria-live="polite"
                >
                  {getUsernameStatusText()}
                </p>
              )}
            </div>
            
            {/* Username Suggestions */}
            {suggestions.length > 0 && (usernameError || isAvailable === false) && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Try these:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 3).map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setUsername(suggestion)}
                      className="h-8 text-xs min-h-[44px] px-4"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-sm font-medium">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about yourself (optional)"
            rows={3}
            className="text-base resize-none"
            aria-describedby="bio-help"
          />
          <p id="bio-help" className="text-xs text-muted-foreground">
            Optional - share something about yourself
          </p>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="border-t bg-card p-6 space-y-4">
        <Button
          onClick={handleSave}
          disabled={isUpdating || isChecking || !displayName.trim() || displayName.length > 40}
          className="w-full min-h-[44px] text-base font-medium"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-4"
            disabled={isUpdating}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
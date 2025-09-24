
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { capitalizeHabitName } from "@/lib/utils";
import { useSocialProfiles } from "@/hooks/useSocialProfiles";
import { useUsernameValidation } from "@/hooks/useUsernameValidation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Settings,
  Target,
  Shield,
  FileText,
  Mail,
  Share2,
  Bell,
  Moon,
  Globe,
  Trash2,
  Download,
  Plus,
  X,
  ChevronRight,
  ArrowLeft,
  Camera,
  User,
  Save,
} from "lucide-react";

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileSettings = ({ open, onOpenChange }: ProfileSettingsProps) => {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState("profile");
  const { currentUserProfile, updateProfile } = useSocialProfiles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile editing states
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Username validation
  const {
    username,
    setUsername,
    isAvailable,
    isChecking: isCheckingUsername,
    error: usernameError,
    errorCode,
    suggestions
  } = useUsernameValidation(displayName, currentUserProfile?.username);
  
  const [habits, setHabits] = useState([
    { id: 1, name: "Morning Workout", active: true },
    { id: 2, name: "Read 30 Minutes", active: true },
    { id: 3, name: "Drink 8 Glasses Water", active: false },
    { id: 4, name: "Meditate", active: true },
    { id: 5, name: "Journal", active: false },
  ]);
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailReminders: false,
    weeklyReports: true,
    friendActivity: true,
  });

  // Initialize local state when profile data becomes available
  React.useEffect(() => {
    if (currentUserProfile) {
      setDisplayName(currentUserProfile.display_name || "");
      setBio(currentUserProfile.bio || "");
    }
  }, [currentUserProfile]); // Username is handled by the useUsernameValidation hook

  const handleSaveProfile = async () => {
    // Validate display name
    if (!displayName.trim()) {
      toast({
        title: "Display name required",
        description: "Please enter a display name",
        variant: "destructive",
      });
      return;
    }

    // Only validate username if it has changed
    if (username !== currentUserProfile?.username && isAvailable === false && username) {
      toast({
        title: "Username Not Available",
        description: usernameError || "This username is not available. Please choose another one.",
        variant: "destructive",
      });
      return;
    }

    // Don't save if still checking username
    if (isCheckingUsername) {
      toast({
        title: "Please wait",
        description: "Still checking username availability",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updates: any = {};
      
      if (displayName.trim() !== currentUserProfile?.display_name) {
        updates.display_name = displayName.trim() || undefined;
      }
      
      if (bio.trim() !== currentUserProfile?.bio) {
        updates.bio = bio.trim() || undefined;
      }

      // Add username to updates if it has changed and is available
      if (username && username !== currentUserProfile?.username && isAvailable) {
        updates.username = username;
      }
      
      // Update profile using the hook (which handles username validation internally)
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated",
        });
      } else {
        toast({
          title: "No changes",
          description: "No changes were made to your profile",
        });
      }
    } catch (error) {
      // Error is already handled by the updateProfile hook
      console.error('Profile update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${currentUserProfile?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('habit-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('habit-photos')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
    setAvatarUploading(false);
    }
  };

  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, active: !habit.active } : habit
    ));
  };

  const menuItems = [
    { id: "profile", label: "Edit Profile", icon: User },
    { id: "habits", label: "Adjust Habits", icon: Target },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "account", label: "Account Settings", icon: Settings },
    { id: "about", label: "About & Legal", icon: FileText },
    { id: "support", label: "Support & Contact", icon: Mail },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <Button 
                onClick={handleSaveProfile} 
                disabled={isUpdating || isCheckingUsername}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {/* Profile Picture Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-4 border-gray-200 dark:border-gray-700">
                      <AvatarImage 
                        src={currentUserProfile?.avatar_url || "/placeholder.svg"} 
                        alt="Profile"
                      />
                      <AvatarFallback className="text-xl font-bold">
                        {(currentUserProfile?.display_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Profile Picture</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Click the camera icon to upload a new profile picture
                    </p>
                    {avatarUploading && (
                      <p className="text-sm text-blue-600">Uploading...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a unique username"
                    className="mt-1"
                  />
                  {isCheckingUsername && (
                    <p className="text-sm text-blue-600 mt-1">Checking availability...</p>
                  )}
                  {usernameError && (
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-red-600">{usernameError}</p>
                      {errorCode === 'USERNAME_RATE_LIMIT' && (
                        <p className="text-xs text-gray-500">
                          You can change your username again in 30 days.
                        </p>
                      )}
                      {errorCode === 'USERNAME_RESERVED' && (
                        <p className="text-xs text-gray-500">
                          Try a different username that isn't reserved.
                        </p>
                      )}
                      {errorCode === 'USERNAME_PROFANE' && (
                        <p className="text-xs text-gray-500">
                          Please choose a more appropriate username.
                        </p>
                      )}
                    </div>
                  )}
                  {username && isAvailable === true && !usernameError && (
                    <p className="text-sm text-green-600 mt-1">✓ Username is available!</p>
                  )}
                  {suggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Suggestions:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestions.slice(0, 3).map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            onClick={() => setUsername(suggestion)}
                            className="h-7 text-xs"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others about yourself"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bio.length}/150 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "habits":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Manage Your Habits</h3>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Habit
              </Button>
            </div>
            <div className="space-y-3">
              {habits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{capitalizeHabitName(habit.name)}</span>
                    {habit.active && <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={habit.active}
                      onCheckedChange={() => toggleHabit(habit.id)}
                    />
                    <Button variant="ghost" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm text-gray-500">
                        {key === 'pushNotifications' && 'Receive push notifications on your device'}
                        {key === 'emailReminders' && 'Get habit reminders via email'}
                        {key === 'weeklyReports' && 'Weekly progress summary'}
                        {key === 'friendActivity' && 'Updates from friends and groups'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Privacy & Security</h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-gray-500">Control who can see your profile</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Export</p>
                      <p className="text-sm text-gray-500">Download your habit data</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-gray-500">Permanently delete your account</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Settings</h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-500">Toggle dark/light theme</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Language</p>
                      <p className="text-sm text-gray-500">English (US)</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Globe className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Time Zone</p>
                      <p className="text-sm text-gray-500">Pacific Standard Time</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "about":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About & Legal</h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Privacy Policy</p>
                      <p className="text-sm text-gray-500">How we handle your data</p>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Terms & Conditions</p>
                      <p className="text-sm text-gray-500">User agreement and terms</p>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">App Version</p>
                      <p className="text-sm text-gray-500">v2.1.0</p>
                    </div>
                    <Badge variant="secondary">Latest</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "support":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support & Contact</h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Contact Support</p>
                      <p className="text-sm text-gray-500">Get help with your account</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Follow Us</p>
                      <p className="text-sm text-gray-500">Stay updated on social media</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Twitter
                      </Button>
                      <Button variant="outline" size="sm">
                        Instagram
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Rate Our App</p>
                      <p className="text-sm text-gray-500">Help us improve with your feedback</p>
                    </div>
                    <Button variant="outline" size="sm">
                      ⭐ Rate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderMobileView = () => (
    <div className="h-full flex flex-col">
      {activeSection === "menu" ? (
        <div className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="w-full flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection("menu")}
              className="mr-3"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            {renderContent()}
          </ScrollArea>
        </div>
      )}
    </div>
  );

  const renderDesktopView = () => (
    <div className="flex h-96">
      {/* Sidebar */}
      <div className="w-1/3 border-r pr-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 pl-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );

  // Set initial state for mobile
  React.useEffect(() => {
    if (isMobile && open) {
      setActiveSection("menu");
    } else if (!isMobile && activeSection === "menu") {
      setActiveSection("profile");
    }
  }, [isMobile, open]);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </SheetTitle>
          </SheetHeader>
          {renderMobileView()}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>
        {renderDesktopView()}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings;

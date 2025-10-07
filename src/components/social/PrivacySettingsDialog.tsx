import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { usePrivacySettings } from "@/hooks/usePrivacySettings";
import { Loader2, Shield, Eye, Users, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PrivacySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacySettingsDialog = ({ open, onOpenChange }: PrivacySettingsDialogProps) => {
  const { settings, loading, saving, updateSettings } = usePrivacySettings();

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </DialogTitle>
          <DialogDescription>
            Control who can see your information and interact with you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Visibility */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Eye className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="profile-visibility" className="text-base font-semibold">
                      Profile Visibility
                    </Label>
                    <CardDescription>
                      Choose who can view your profile
                    </CardDescription>
                  </div>
                  <Select
                    value={settings.profile_visibility}
                    onValueChange={(value: any) =>
                      updateSettings({ profile_visibility: value })
                    }
                    disabled={saving}
                  >
                    <SelectTrigger id="profile-visibility" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Public</span>
                          <span className="text-xs text-muted-foreground">
                            Anyone can see your profile
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Friends Only</span>
                          <span className="text-xs text-muted-foreground">
                            Only your friends can see your profile
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Private</span>
                          <span className="text-xs text-muted-foreground">
                            Nobody can see your profile
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Friend Requests */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Users className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="friend-requests" className="text-base font-semibold">
                      Who Can Send Friend Requests
                    </Label>
                    <CardDescription>
                      Control who can send you friend requests
                    </CardDescription>
                  </div>
                  <Select
                    value={settings.allow_friend_requests}
                    onValueChange={(value: any) =>
                      updateSettings({ allow_friend_requests: value })
                    }
                    disabled={saving}
                  >
                    <SelectTrigger id="friend-requests" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Everyone</span>
                          <span className="text-xs text-muted-foreground">
                            Anyone can send you a friend request
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="friends_of_friends">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Friends of Friends</span>
                          <span className="text-xs text-muted-foreground">
                            Only people with mutual friends
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="nobody">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Nobody</span>
                          <span className="text-xs text-muted-foreground">
                            Disable all friend requests
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Activity Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-semibold">Activity & Visibility</Label>
            </div>

            <div className="space-y-4 pl-7">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="online-status">Show Online Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Let friends see when you're online
                  </p>
                </div>
                <Switch
                  id="online-status"
                  checked={settings.show_online_status}
                  onCheckedChange={(checked) =>
                    updateSettings({ show_online_status: checked })
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-activity">Show Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Let friends see your recent activity
                  </p>
                </div>
                <Switch
                  id="show-activity"
                  checked={settings.show_activity}
                  onCheckedChange={(checked) =>
                    updateSettings({ show_activity: checked })
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-habits">Show Habits</Label>
                  <p className="text-sm text-muted-foreground">
                    Let friends see your habits and progress
                  </p>
                </div>
                <Switch
                  id="show-habits"
                  checked={settings.show_habits}
                  onCheckedChange={(checked) =>
                    updateSettings({ show_habits: checked })
                  }
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
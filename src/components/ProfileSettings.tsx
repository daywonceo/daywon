
import React, { useState } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { capitalizeHabitName } from "@/lib/utils";
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
} from "lucide-react";

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileSettings = ({ open, onOpenChange }: ProfileSettingsProps) => {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState("habits");
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

  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, active: !habit.active } : habit
    ));
  };

  const menuItems = [
    { id: "habits", label: "Adjust Habits", icon: Target },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "account", label: "Account Settings", icon: Settings },
    { id: "about", label: "About & Legal", icon: FileText },
    { id: "support", label: "Support & Contact", icon: Mail },
  ];

  const renderContent = () => {
    switch (activeSection) {
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
      setActiveSection("habits");
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

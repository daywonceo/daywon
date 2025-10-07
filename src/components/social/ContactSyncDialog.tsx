import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ContactRound, Upload, UserCheck, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContactSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Contact {
  email: string;
  name?: string;
}

interface MatchedContact extends Contact {
  userId?: string;
  displayName?: string;
  inFriendsList?: boolean;
}

export const ContactSyncDialog = ({ open, onOpenChange }: ContactSyncDialogProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [matchedContacts, setMatchedContacts] = useState<MatchedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const parsedContacts: Contact[] = [];
      
      // Skip header row if present
      const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        // Handle CSV: name,email or just email
        const parts = line.split(',').map(p => p.trim());
        
        if (parts.length >= 2) {
          parsedContacts.push({ name: parts[0], email: parts[1] });
        } else if (parts.length === 1 && parts[0].includes('@')) {
          parsedContacts.push({ email: parts[0] });
        }
      }

      setContacts(parsedContacts);
      
      // Match contacts with existing users
      await matchContactsWithUsers(parsedContacts);
      
      toast({
        title: "Contacts Loaded",
        description: `Found ${parsedContacts.length} contacts`,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: "Failed to read contacts file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const matchContactsWithUsers = async (contactsList: Contact[]) => {
    setSyncing(true);
    try {
      const emails = contactsList.map(c => c.email.toLowerCase());
      
      // Query profiles for matching emails
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('email', emails);

      if (error) throw error;

      // Get current user's friends
      const { data: { user } } = await supabase.auth.getUser();
      let friendIds: string[] = [];
      
      if (user) {
        const { data: friends } = await supabase
          .from('user_relationships')
          .select('following_id, follower_id')
          .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (friends) {
          friendIds = friends.map(f => 
            f.follower_id === user.id ? f.following_id : f.follower_id
          );
        }
      }

      // Match contacts with profiles
      const matched: MatchedContact[] = contactsList.map(contact => {
        const profile = profiles?.find(p => p.email?.toLowerCase() === contact.email.toLowerCase());
        return {
          ...contact,
          userId: profile?.id,
          displayName: profile?.display_name,
          inFriendsList: profile?.id ? friendIds.includes(profile.id) : false,
        };
      });

      setMatchedContacts(matched);
    } catch (error) {
      console.error('Error matching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to match contacts with users",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const registeredContacts = matchedContacts.filter(c => c.userId);
  const notRegisteredContacts = matchedContacts.filter(c => !c.userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ContactRound className="h-5 w-5" />
            Find Friends from Contacts
          </DialogTitle>
          <DialogDescription>
            Upload your contacts to find friends already on Daywon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your contact data is processed locally and never stored on our servers.
              We only use emails to match with existing users.
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="consent"
              checked={hasConsent}
              onCheckedChange={(checked) => setHasConsent(checked as boolean)}
            />
            <Label htmlFor="consent" className="text-sm cursor-pointer">
              I consent to temporarily processing my contact list to find friends
            </Label>
          </div>

          {!hasConsent ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Please provide consent above to continue
                </p>
              </CardContent>
            </Card>
          ) : contacts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <CardDescription className="mb-4">
                    Upload a CSV file with your contacts (email addresses)
                  </CardDescription>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="contact-upload"
                    disabled={loading}
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="contact-upload" className="cursor-pointer">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                        </>
                      )}
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {syncing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {registeredContacts.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        On Daywon ({registeredContacts.length})
                      </h3>
                      <div className="space-y-2">
                        {registeredContacts.map((contact, idx) => (
                          <Card key={idx}>
                            <CardContent className="pt-4 pb-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{contact.displayName}</p>
                                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                                </div>
                                {contact.inFriendsList ? (
                                  <Badge>Already Friends</Badge>
                                ) : (
                                  <Button size="sm" variant="outline">
                                    Add Friend
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {notRegisteredContacts.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        Not on Daywon ({notRegisteredContacts.length})
                      </h3>
                      <CardDescription className="mb-3">
                        You can invite these friends to join
                      </CardDescription>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
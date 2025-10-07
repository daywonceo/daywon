import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriendInvitations } from "@/hooks/useFriendInvitations";
import { Mail, Send, Loader2, Copy, CheckCircle2, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface InviteFriendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteFriendsDialog = ({ open, onOpenChange }: InviteFriendsDialogProps) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const { invitations, sending, sendInvitation } = useFriendInvitations();

  const handleSendInvitation = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const result = await sendInvitation(email, message);
    if (result.success) {
      setEmail("");
      setMessage("");
    }
  };

  const copyInviteLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast({
      title: "Link Copied!",
      description: "Invitation link copied to clipboard",
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Friends
          </DialogTitle>
          <DialogDescription>
            Send invitations to friends via email
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Send Invitation</TabsTrigger>
            <TabsTrigger value="sent">
              Sent Invitations ({invitations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={sending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message to your invitation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSendInvitation}
                disabled={sending || !email}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No invitations sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <Card key={invitation.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{invitation.email}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Sent {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                          </p>
                          {invitation.status === 'pending' && (
                            <p className="text-xs text-muted-foreground">
                              Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={
                              invitation.status === 'accepted'
                                ? 'default'
                                : invitation.status === 'expired'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {invitation.status}
                          </Badge>
                          {invitation.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const appUrl = "https://174b4693-b539-4415-85b6-f15f0d4d07a6.lovableproject.com";
                                copyInviteLink(`${appUrl}/signup?invite=${invitation.token}`);
                              }}
                            >
                              {copiedLink ? (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Link
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useFriendInvitations } from "@/hooks/useFriendInvitations";
import { CheckCircle2, XCircle, Loader2, Mail, AlertCircle, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const InvitationTestPanel = () => {
  const [testEmail, setTestEmail] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [testResults, setTestResults] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
    details?: any;
  }>({ status: 'idle' });

  const { sendInvitation, sending, invitations } = useFriendInvitations();

  const runTest = async () => {
    if (!testEmail) return;

    setTestResults({ status: 'testing' });

    try {
      const result = await sendInvitation(testEmail, testMessage);
      
      if (result.success) {
        setTestResults({
          status: 'success',
          message: 'Invitation sent successfully!',
          details: result.data
        });
      } else {
        setTestResults({
          status: 'error',
          message: result.existingUserId 
            ? 'User already registered - check console for userId'
            : 'Failed to send invitation',
          details: result
        });
      }
    } catch (error: any) {
      setTestResults({
        status: 'error',
        message: error.message || 'Unknown error occurred',
        details: error
      });
    }
  };

  const getStatusIcon = () => {
    switch (testResults.status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Mail className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Invitation System Test
          </CardTitle>
          <CardDescription>
            Test the friend invitation email delivery system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Prerequisites</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">1</Badge>
                  Resend API key configured in Supabase secrets
                </p>
                <p className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">2</Badge>
                  Domain verified at{" "}
                  <a 
                    href="https://resend.com/domains" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    resend.com/domains
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">3</Badge>
                  Edge function deployed and accessible
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                disabled={sending}
              />
              <p className="text-xs text-muted-foreground">
                Use your own email to verify delivery
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-message">Test Message (Optional)</Label>
              <Textarea
                id="test-message"
                placeholder="Test invitation message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                disabled={sending}
                rows={3}
              />
            </div>

            <Button
              onClick={runTest}
              disabled={sending || !testEmail}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Test...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Invitation
                </>
              )}
            </Button>
          </div>

          {testResults.status !== 'idle' && (
            <Alert variant={testResults.status === 'error' ? 'destructive' : 'default'}>
              <div className="flex items-start gap-3">
                {getStatusIcon()}
                <div className="flex-1">
                  <AlertTitle>
                    {testResults.status === 'testing' && 'Testing...'}
                    {testResults.status === 'success' && 'Success!'}
                    {testResults.status === 'error' && 'Error'}
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    {testResults.message && (
                      <p className="text-sm">{testResults.message}</p>
                    )}
                    {testResults.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                          {JSON.stringify(testResults.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invitations</CardTitle>
          <CardDescription>
            View the last {invitations.length} invitations sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invitations sent yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invitations.slice(0, 5).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inv.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      inv.status === 'accepted'
                        ? 'default'
                        : inv.status === 'expired'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {inv.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Common Issues:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Email not received → Check spam folder</li>
              <li>Domain verification required → Visit resend.com/domains</li>
              <li>Rate limits → Resend free tier: 100 emails/day</li>
              <li>RESEND_API_KEY missing → Check Supabase edge function secrets</li>
              <li>"User already registered" → Email is already in use</li>
            </ul>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Check Edge Function Logs:</h4>
            <p className="text-muted-foreground">
              View detailed logs in Supabase Dashboard → Edge Functions → send-friend-invitation → Logs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

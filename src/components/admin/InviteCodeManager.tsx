import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOptimized } from '@/hooks/useAuthOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Plus, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InviteCode {
  id: string;
  code: string;
  is_used: boolean;
  created_at: string;
  used_at: string | null;
  used_by: string | null;
  expires_at: string;
}

export const InviteCodeManager = () => {
  const { user } = useAuthOptimized();
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user?.id]);

  useEffect(() => {
    if (isAdmin) {
      fetchInviteCodes();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!error && data) {
      setIsAdmin(true);
    }
    setLoading(false);
  };

  const fetchInviteCodes = async () => {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInviteCodes(data);
    }
  };

  const generateInviteCode = async () => {
    if (!user?.id) return;

    const unusedCount = inviteCodes.filter(code => !code.is_used).length;
    if (unusedCount >= 25) {
      toast.error('Maximum of 25 unused invite codes reached');
      return;
    }

    setGenerating(true);
    const code = `DAYWON-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const { error } = await supabase
      .from('invite_codes')
      .insert({
        code,
        created_by: user.id,
      });

    if (error) {
      toast.error('Failed to generate invite code');
    } else {
      toast.success('Invite code generated!');
      fetchInviteCodes();
    }
    setGenerating(false);
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/redeem?code=${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have admin access to manage invite codes.
        </AlertDescription>
      </Alert>
    );
  }

  const unusedCount = inviteCodes.filter(code => !code.is_used).length;
  const usedCount = inviteCodes.filter(code => code.is_used).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Shield className="h-5 w-5" />
          Day Won Member Invite Codes
        </CardTitle>
        <CardDescription className="text-sm">
          Generate and manage exclusive invite codes (Max 25 unused)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs sm:text-sm">{unusedCount} Available</Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">{usedCount} Used</Badge>
          </div>
          <Button
            onClick={generateInviteCode}
            disabled={generating || unusedCount >= 25}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Code
          </Button>
        </div>

        <div className="space-y-3">
          {inviteCodes.map((code) => (
            <div
              key={code.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg bg-card"
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs sm:text-sm font-semibold break-all">{code.code}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {code.is_used 
                    ? `Used on ${new Date(code.used_at!).toLocaleDateString()}`
                    : `Expires ${new Date(code.expires_at).toLocaleDateString()}`
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Badge 
                  variant={code.is_used ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {code.is_used ? 'Used' : 'Active'}
                </Badge>
                {!code.is_used && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyInviteLink(code.code)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

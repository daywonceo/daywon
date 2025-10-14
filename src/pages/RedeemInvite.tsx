import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOptimized } from '@/hooks/useAuthOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const RedeemInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthOptimized();
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setCode(codeFromUrl);
    }
  }, [searchParams]);

  const handleRedeem = async () => {
    if (!user) {
      toast.error('Please sign in to redeem an invite code');
      navigate('/login');
      return;
    }

    if (!code.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setRedeeming(true);

    const { data, error } = await supabase.rpc('redeem_invite_code', {
      p_code: code.trim()
    });

    if (error) {
      toast.error('Failed to redeem invite code');
      console.error(error);
    } else if (data?.success) {
      toast.success('🎉 ' + data.message);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } else {
      toast.error(data?.error || 'Invalid invite code');
    }

    setRedeeming(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Day Won Member</CardTitle>
            <CardDescription className="text-base">
              Enter your exclusive invite code to unlock Day Won Member status and get access to all features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                placeholder="DAYWON-XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>

            <Button
              onClick={handleRedeem}
              disabled={redeeming || !code.trim()}
              className="w-full"
              size="lg"
            >
              {redeeming ? 'Redeeming...' : 'Redeem Invite Code'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Day Won Member Benefits:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✨ Lifetime access to all premium features</li>
                <li>🎁 Exclusive merchandise and perks</li>
                <li>🚀 Early access to new features</li>
                <li>👑 Special Day Won Member badge</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RedeemInvite;

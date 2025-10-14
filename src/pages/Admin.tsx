import { InviteCodeManager } from '@/components/admin/InviteCodeManager';
import { useAuthOptimized } from '@/hooks/useAuthOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, User } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Admin = () => {
  const { user } = useAuthOptimized();

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast.success('User ID copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        {/* User ID Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your User ID
            </CardTitle>
            <CardDescription>
              Use this ID to grant yourself admin access in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
                {user?.id || 'Not logged in'}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyUserId}
                disabled={!user?.id}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Run this SQL in Supabase to become admin:
            </p>
            <code className="block mt-2 p-3 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
              INSERT INTO user_roles (user_id, role) VALUES ('{user?.id}', 'admin');
            </code>
          </CardContent>
        </Card>

        <InviteCodeManager />
      </main>
      <Footer />
    </div>
  );
};

export default Admin;

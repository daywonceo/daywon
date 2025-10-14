import { InviteCodeManager } from '@/components/admin/InviteCodeManager';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <InviteCodeManager />
      </main>
      <Footer />
    </div>
  );
};

export default Admin;

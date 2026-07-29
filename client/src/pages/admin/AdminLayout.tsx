import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAdminSession } from "@/lib/useAdminSession";
import AdminNotes from "./AdminNotes";
import AdminMenu from "./AdminMenu";
import AdminCommunity from "./AdminCommunity";

// A small tabbed shell is enough for a panel this size — no nested wouter
// router needed for /admin/notes, /admin/menu, etc.
export default function AdminLayout() {
  const { session, loading } = useAdminSession();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Client-side redirect is UX only — every admin API call is
    // independently gated server-side by requireAdmin() regardless of
    // whether this redirect ever runs.
    if (!loading && !session) {
      navigate("/login");
    }
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-body text-charcoal-light">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream p-6 lg:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-charcoal font-semibold">Istoria Admin</h1>
        <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </div>

      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes">Freedom Wall</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>
        <TabsContent value="notes" className="pt-4">
          <AdminNotes />
        </TabsContent>
        <TabsContent value="menu" className="pt-4">
          <AdminMenu />
        </TabsContent>
        <TabsContent value="community" className="pt-4">
          <AdminCommunity />
        </TabsContent>
      </Tabs>
    </div>
  );
}

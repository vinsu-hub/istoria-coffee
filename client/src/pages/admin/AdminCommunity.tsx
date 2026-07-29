import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminSession } from "@/lib/useAdminSession";
import { toast } from "sonner";

interface PendingSubmission {
  id: string;
  comment: string | null;
  imageUrl: string | null;
  createdAt: string;
  deviceId: string | null;
}

export default function AdminCommunity() {
  const { authFetch } = useAdminSession();
  const [pending, setPending] = useState<PendingSubmission[] | null>(null);

  async function load() {
    const res = await authFetch("/api/admin-submissions");
    if (!res.ok) {
      toast.error("Failed to load pending submissions.");
      return;
    }
    const data = await res.json();
    setPending(data.submissions);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function moderate(id: string, decision: "approved" | "rejected") {
    const res = await authFetch("/api/admin-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    if (!res.ok) {
      toast.error("Couldn't update that submission.");
      return;
    }
    setPending((prev) => prev?.filter((item) => item.id !== id) ?? null);
    toast.success(decision === "approved" ? "Approved." : "Rejected.");
  }

  if (pending === null) {
    return <p className="text-sm text-muted-foreground">Loading submissions…</p>;
  }

  if (pending.length === 0) {
    return <p className="text-sm text-muted-foreground">No pending submissions.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {pending.map((item) => (
        <div key={item.id} className="border rounded-sm overflow-hidden bg-card">
          {item.imageUrl && (
            <img src={item.imageUrl} alt="" className="w-full aspect-square object-cover" />
          )}
          {item.comment && <p className="text-sm p-3">{item.comment}</p>}
          <div className="flex gap-2 p-3 pt-0">
            <Button size="sm" onClick={() => moderate(item.id, "approved")}>
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => moderate(item.id, "rejected")}>
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

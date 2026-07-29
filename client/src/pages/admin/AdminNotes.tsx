import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminSession } from "@/lib/useAdminSession";
import { toast } from "sonner";

interface WallNote {
  id: string;
  message: string;
  createdAt: string;
  displayDate: string;
}

export default function AdminNotes() {
  const { authFetch } = useAdminSession();
  const [notes, setNotes] = useState<WallNote[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadNotes() {
    const res = await authFetch("/api/admin-notes");
    if (!res.ok) {
      toast.error("Failed to load Freedom Wall notes.");
      return;
    }
    const data = await res.json();
    setNotes(data.notes);
  }

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await authFetch(`/api/admin-notes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Couldn't delete that note.");
        return;
      }
      setNotes((prev) => prev?.filter((note) => note.id !== id) ?? null);
      toast.success("Note deleted.");
    } finally {
      setDeletingId(null);
    }
  }

  if (notes === null) {
    return <p className="text-sm text-muted-foreground">Loading notes…</p>;
  }

  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">No notes on the Freedom Wall yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Message</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {notes.map((note) => (
          <TableRow key={note.id}>
            <TableCell className="max-w-md">{note.message}</TableCell>
            <TableCell>{note.displayDate}</TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingId === note.id}
                onClick={() => handleDelete(note.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

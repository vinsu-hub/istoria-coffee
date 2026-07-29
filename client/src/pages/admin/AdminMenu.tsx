import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Category {
  key: string;
  section: "drinks" | "food";
  label: string;
  blurb: string;
  sort_order: number;
}

interface MenuItemRow {
  id: string;
  categoryKey: string;
  name: string;
  price?: number;
  hot?: number;
  iced?: number;
  tag?: string;
  note?: string;
  servesNote?: string;
}

const emptyForm = {
  id: "",
  categoryKey: "",
  name: "",
  price: "",
  hot: "",
  iced: "",
  tag: "",
  note: "",
  isAddon: false,
};

export default function AdminMenu() {
  const { authFetch } = useAdminSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    const [catRes, menuRes] = await Promise.all([
      authFetch("/api/admin-menu"),
      fetch("/api/menu"),
    ]);
    if (catRes.ok) {
      const catData = await catRes.json();
      setCategories(catData.categories);
    }
    if (menuRes.ok) {
      const menu = await menuRes.json();
      const flat: MenuItemRow[] = [];
      for (const section of ["drinks", "food"] as const) {
        for (const [categoryKey, sectionItems] of Object.entries(
          menu[section] as Record<string, MenuItemRow[]>
        )) {
          for (const item of sectionItems) {
            flat.push({ ...item, categoryKey });
          }
        }
      }
      for (const item of menu.addOns as MenuItemRow[]) {
        flat.push({ ...item, categoryKey: "addOns" });
      }
      setItems(flat);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(item: MenuItemRow) {
    setEditingId(item.id);
    setForm({
      id: item.id,
      categoryKey: item.categoryKey,
      name: item.name,
      price: item.price?.toString() ?? "",
      hot: item.hot?.toString() ?? "",
      iced: item.iced?.toString() ?? "",
      tag: item.tag ?? "",
      note: item.note ?? "",
      isAddon: item.categoryKey === "addOns",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.categoryKey) {
      toast.error("Name and category are required.");
      return;
    }
    if (!editingId && !form.id.trim()) {
      toast.error("An item id (slug) is required.");
      return;
    }

    const payload = {
      id: form.id.trim(),
      categoryKey: form.categoryKey,
      name: form.name.trim(),
      price: form.price ? Number(form.price) : undefined,
      hot: form.hot ? Number(form.hot) : undefined,
      iced: form.iced ? Number(form.iced) : undefined,
      tag: form.tag.trim() || undefined,
      note: form.note.trim() || undefined,
      isAddon: form.isAddon,
    };

    setSaving(true);
    try {
      const res = editingId
        ? await authFetch(`/api/admin-menu?id=${encodeURIComponent(editingId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await authFetch("/api/admin-menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Couldn't save that item.");
        return;
      }

      toast.success(editingId ? "Item updated." : "Item added.");
      setDialogOpen(false);
      await loadAll();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await authFetch(`/api/admin-menu?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Couldn't delete that item.");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item deleted.");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Add item</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="w-40" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.categoryKey}</TableCell>
              <TableCell>
                {item.price != null ? `₱${item.price}` : `Hot ₱${item.hot} / Iced ₱${item.iced}`}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit item" : "Add item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {!editingId && (
              <div>
                <Label htmlFor="id">Id (slug, e.g. "americano")</Label>
                <Input
                  id="id"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.categoryKey}
                onValueChange={(value) => setForm({ ...form, categoryKey: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.key} value={cat.key}>
                      {cat.label} ({cat.section})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="hot">Hot</Label>
                <Input
                  id="hot"
                  type="number"
                  value={form.hot}
                  onChange={(e) => setForm({ ...form, hot: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="iced">Iced</Label>
                <Input
                  id="iced"
                  type="number"
                  value={form.iced}
                  onChange={(e) => setForm({ ...form, iced: e.target.value })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Use Price for a single price, or Hot/Iced for split pricing — not both.
            </p>

            <div>
              <Label htmlFor="tag">Tag (optional, e.g. "possible-bestseller")</Label>
              <Input
                id="tag"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isAddon"
                checked={form.isAddon}
                onCheckedChange={(checked) => setForm({ ...form, isAddon: checked === true })}
              />
              <Label htmlFor="isAddon">This is an add-on, not a menu item</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

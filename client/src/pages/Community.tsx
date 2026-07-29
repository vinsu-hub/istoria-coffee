import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDeviceId } from "@/hooks/useDeviceId";
import { toast } from "sonner";

interface Submission {
  id: string;
  comment: string | null;
  imageUrl: string | null;
  createdAt: string;
}

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CommunityPage() {
  const deviceId = useDeviceId();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadApproved() {
    const res = await fetch("/api/submissions");
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions);
    }
  }

  useEffect(() => {
    loadApproved();
  }, []);

  async function handleSubmit() {
    if (!comment.trim() && !imageFile) {
      toast.error("Add a comment or a photo first.");
      return;
    }

    setSubmitting(true);
    try {
      const imageBase64 = imageFile ? await resizeImageToDataUrl(imageFile) : undefined;
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment.trim() || undefined, imageBase64, deviceId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Couldn't submit — please try again.");
        return;
      }

      toast.success("Thanks! Your post is awaiting approval before it appears here.");
      setComment("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Couldn't submit — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Nav />

      <main className="flex-1 pt-20 lg:pt-24">
        <section className="py-14 lg:py-20">
          <div className="container text-center">
            <p className="font-accent text-2xl text-charcoal-light mb-3">Community</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-charcoal font-bold mb-5">
              Share your Istoria
            </h1>
            <p className="font-body text-base sm:text-lg text-charcoal-light max-w-sm mx-auto leading-relaxed">
              Post a photo or a note about your visit. Approved posts show up below.
            </p>
          </div>
        </section>

        <section className="container pb-14">
          <div className="max-w-xl mx-auto bg-warm-white border border-border rounded-sm p-6 space-y-4">
            <Textarea
              placeholder="What did you love about your visit?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            <Button onClick={handleSubmit} disabled={submitting} className="w-full">
              {submitting ? "Submitting…" : "Submit for approval"}
            </Button>
          </div>
        </section>

        <section className="container pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-card border border-border rounded-sm overflow-hidden"
              >
                {sub.imageUrl && (
                  <img src={sub.imageUrl} alt="" className="w-full aspect-square object-cover" />
                )}
                {sub.comment && (
                  <p className="font-body text-sm text-charcoal p-4">{sub.comment}</p>
                )}
              </div>
            ))}
          </div>
          {submissions.length === 0 && (
            <p className="text-center font-body text-sm text-charcoal-light">
              No posts yet — be the first to share.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

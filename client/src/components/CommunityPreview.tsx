import { useEffect, useState } from "react";
import { Link } from "wouter";

/**
 * CommunityPreview — homepage section showing the latest 4 approved
 * community posts from /api/submissions. Links to /community for the full
 * gallery + submission form. Sits right below BoardPreview (Freedom Wall).
 */

interface Submission {
  id: string;
  comment: string | null;
  imageUrl: string | null;
}

export default function CommunityPreview() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSubmissions((data.submissions ?? []).slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setSubmissions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (submissions.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-parchment">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10">
          <div>
            <p className="font-accent text-xl text-charcoal-light mb-1">Community</p>
            <h2 className="font-display text-3xl sm:text-4xl text-charcoal font-semibold">
              Shared by our regulars
            </h2>
          </div>
          <Link
            href="/community"
            className="mt-4 lg:mt-0 font-body text-sm text-espresso hover:text-espresso-light transition-colors font-medium"
          >
            See more →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-card border border-border rounded-sm overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {sub.imageUrl && (
                <img src={sub.imageUrl} alt="" className="w-full aspect-square object-cover" />
              )}
              {sub.comment && (
                <p className="font-body text-sm text-charcoal p-4 leading-relaxed">
                  {sub.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

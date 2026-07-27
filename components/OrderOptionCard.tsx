type OrderOptionCardProps = {
  name: string;
  blurb: string;
  href?: string; // official store listing URL — omit while unconfirmed (Appendix E)
};

export default function OrderOptionCard({ name, blurb, href }: OrderOptionCardProps) {
  const pending = !href;

  return (
    <div className="flex flex-col gap-3 bg-neutral-100 rounded-3xl p-6">
      <span className="font-heading text-xl">{name}</span>
      <p className="text-sm text-ink/70 flex-1">{blurb}</p>
      {pending ? (
        <span className="btn opacity-45 cursor-not-allowed bg-neutral-300 text-ink/60">
          Store link pending
        </span>
      ) : (
        <a href={href} target="_blank" rel="noreferrer" className="btn btn-primary">
          Open App →
        </a>
      )}
    </div>
  );
}

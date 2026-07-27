export default function PhotoPlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`washed bg-neutral-300 grid place-items-center text-neutral-600 text-xs px-4 text-center ${className}`}
    >
      {label}
    </div>
  );
}

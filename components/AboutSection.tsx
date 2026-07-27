import PhotoPlaceholder from "./PhotoPlaceholder";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="px-5 md:px-10 pt-14 pb-2 grid gap-7 max-w-3xl"
    >
      <div className="max-w-[46ch]">
        <span className="block text-xs tracking-wide uppercase font-semibold text-accent-700 mb-3.5">
          The shop
        </span>
        <h2 className="text-[26px] md:text-[34px] leading-tight">
          A late table, always free
        </h2>
        <p className="text-[15.5px] leading-relaxed mt-4 text-ink/78">
          Istoria opens when the afternoon slows down and closes when the
          last story does. Warm wood, low lamps, mismatched chairs — the
          kind of place where one cup turns into three and nobody looks at
          the clock. Bring your barkada, your notebook, or nothing at all.
        </p>
      </div>
      <PhotoPlaceholder
        label="Interior: wood table, warm lamp, evening (photo pending)"
        className="w-full aspect-[3/2] rounded-3xl"
      />
    </section>
  );
}

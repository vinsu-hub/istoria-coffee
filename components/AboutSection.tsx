import PhotoPlaceholder from "./PhotoPlaceholder";

export default function AboutSection() {
  return (
    <section id="about" className="px-5 md:px-10 pt-14 pb-2 max-w-3xl">
      <PhotoPlaceholder
        label="Interior: wood table, warm lamp, evening (photo pending)"
        className="w-full aspect-[3/2] rounded-3xl"
      />
    </section>
  );
}

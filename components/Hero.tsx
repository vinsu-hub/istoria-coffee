"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const DESKTOP_FRAME_COUNT = 120;
const MOBILE_FRAME_COUNT = 60;
const MOBILE_BREAKPOINT = 768;

// Chapter progress bands as [start, end] fractions of total scroll progress,
// with a short cross-dissolve band at each boundary. Computed directly from
// scroll progress every tick (no CSS transitions, no chapter-index state) so
// a chapter's fade-out and the next one's fade-in are always exact mirror
// images of each other — never both fully visible at once.
const CHAPTER_BANDS: [number, number][] = [
  [0, 0.36],
  [0.32, 0.68],
  [0.64, 1],
];
const FADE = 0.04;

function frameSrc(isMobile: boolean, index: number): string {
  const folder = isMobile ? "mobile" : "desktop";
  const num = String(index + 1).padStart(3, "0");
  return `/images/hero-sequence/${folder}/${num}.webp`;
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > canvasRatio) {
    drawHeight = height;
    drawWidth = height * imgRatio;
    offsetX = (width - drawWidth) / 2;
  } else {
    drawWidth = width;
    drawHeight = width / imgRatio;
    offsetY = (height - drawHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function bandOpacity(progress: number, [start, end]: [number, number]): number {
  if (progress <= start - FADE || progress >= end + FADE) return 0;
  if (progress < start + FADE) return (progress - (start - FADE)) / (2 * FADE);
  if (progress > end - FADE) return (end + FADE - progress) / (2 * FADE);
  return 1;
}

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const frameCount = isMobile ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT;
    const targetFrame = reducedMotion ? Math.round((frameCount - 1) * 0.5) : 0;
    const images: HTMLImageElement[] = [];
    let currentExact = targetFrame;
    let cancelled = false;
    let trigger: import("gsap/ScrollTrigger").ScrollTrigger | undefined;

    function renderFrame(exact: number) {
      if (!canvas) return;
      currentExact = exact;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const i0 = Math.max(0, Math.min(frameCount - 1, Math.floor(exact)));
      const i1 = Math.min(frameCount - 1, i0 + 1);
      const t = exact - i0;
      const img0 = images[i0];
      if (!img0?.complete) return;
      ctx!.clearRect(0, 0, w, h);
      drawImageCover(ctx!, img0, w, h);
      const img1 = images[i1];
      if (t > 0.02 && img1?.complete && i1 !== i0) {
        ctx!.globalAlpha = t;
        drawImageCover(ctx!, img1, w, h);
        ctx!.globalAlpha = 1;
      }
    }

    function updateChapters(progress: number) {
      copyRefs.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const opacity = bandOpacity(progress, CHAPTER_BANDS[i]);
        el.style.opacity = String(opacity);
        el.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
      });
    }

    function resizeCanvas() {
      if (!canvas || !section) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = section.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx?.scale(dpr, dpr);
      renderFrame(currentExact);
    }

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      if (i === targetFrame) img.fetchPriority = "high";
      img.src = frameSrc(isMobile, i);
      img.onload = () => {
        if (cancelled) return;
        if (i === targetFrame) {
          renderFrame(targetFrame);
          setLoaded(true);
          setRevealed(true);
          updateChapters(reducedMotion ? 0.5 : 0);
          window.dispatchEvent(new Event("hero-ready"));
        }
      };
      images.push(img);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (!reducedMotion) {
      // gsap/ScrollTrigger are dynamically imported so they ship in a separate
      // chunk rather than bloating the page's main JS bundle and hydration cost.
      import("gsap").then(({ default: gsap }) =>
        import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
          if (cancelled) return;
          gsap.registerPlugin(ScrollTrigger);
          trigger = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.2}`,
            pin: true,
            scrub: 0.5,
            onUpdate: (self) => {
              renderFrame(self.progress * (frameCount - 1));
              updateChapters(self.progress);
            },
          });
        }),
      );
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeCanvas);
      trigger?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const background = (
    <>
      <img
        src={frameSrc(true, 0)}
        alt=""
        aria-hidden
        fetchPriority="high"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100 blur-md scale-105"
        }`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`washed absolute inset-0 w-full h-full transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/55 via-transparent to-transparent" />
    </>
  );

  if (reducedMotion) {
    return (
      <section ref={sectionRef} className="relative w-full min-h-[100svh] overflow-hidden bg-neutral-900">
        {background}
        <div className="relative flex flex-col justify-end px-5 md:px-10 py-16 md:py-24 gap-10">
          <div>
            <h1 className="text-[40px] md:text-[62px] leading-[1.04] tracking-tight text-neutral-100">
              Kape at
              <br />
              Kwentuhan
            </h1>
            <p className="text-base leading-relaxed mt-4.5 max-w-[42ch] text-neutral-100/85">
              A small coffee shop in Bay, Laguna. Slow drinks, long
              conversations, open until the streets go quiet.
            </p>
          </div>
          <div className="max-w-[46ch]">
            <span className="block text-xs tracking-wide uppercase font-semibold text-accent-200 mb-3">
              The shop
            </span>
            <h2 className="text-[26px] md:text-[34px] leading-tight text-neutral-100">
              A late table, always free
            </h2>
            <p className="text-[15.5px] leading-relaxed mt-4 text-neutral-100/78">
              Istoria opens when the afternoon slows down and closes when the
              last story does. Warm wood, low lamps, mismatched chairs — the
              kind of place where one cup turns into three and nobody looks
              at the clock.
            </p>
          </div>
          <div>
            <p className="text-lg text-neutral-100/90 max-w-[36ch]">
              Bring your barkada, your notebook, or nothing at all.
            </p>
          </div>
          <Link href="/order" className="btn btn-primary self-start">
            Tara, Kape? →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative w-full h-[100svh] overflow-hidden bg-neutral-900">
      {background}

      <div
        className={`absolute inset-0 flex flex-col justify-end px-5 md:px-10 pb-16 md:pb-24 transition-opacity duration-500 ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="relative min-h-[190px] md:min-h-[165px]">
          <div ref={copyRefs[0]} className="absolute inset-0 flex flex-col justify-end">
            <h1 className="text-[40px] md:text-[62px] leading-[1.04] tracking-tight text-neutral-100">
              Kape at
              <br />
              Kwentuhan
            </h1>
            <p className="text-base leading-relaxed mt-4.5 max-w-[42ch] text-neutral-100/85">
              A small coffee shop in Bay, Laguna. Slow drinks, long
              conversations, open until the streets go quiet.
            </p>
          </div>

          <div ref={copyRefs[1]} className="absolute inset-0 flex flex-col justify-end opacity-0">
            <span className="block text-xs tracking-wide uppercase font-semibold text-accent-200 mb-3">
              The shop
            </span>
            <h2 className="text-[26px] md:text-[34px] leading-tight text-neutral-100">
              A late table, always free
            </h2>
            <p className="text-[15.5px] leading-relaxed mt-4 text-neutral-100/85 max-w-[44ch]">
              Istoria opens when the afternoon slows down and closes when the
              last story does. Warm wood, low lamps, mismatched chairs — the
              kind of place where one cup turns into three and nobody looks at
              the clock.
            </p>
          </div>

          <div ref={copyRefs[2]} className="absolute inset-0 flex flex-col justify-end opacity-0">
            <p className="text-2xl md:text-3xl text-neutral-100 leading-snug max-w-[24ch]">
              Bring your barkada, your notebook, or nothing at all.
            </p>
          </div>
        </div>

        <Link href="/order" className="btn btn-primary self-start mt-6">
          Tara, Kape? →
        </Link>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PhotoPlaceholder from "./PhotoPlaceholder";

const DESKTOP_FRAME_COUNT = 120;
const MOBILE_FRAME_COUNT = 60;
const MOBILE_BREAKPOINT = 768;
const CHAPTER_COUNT = 3;

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

function chapterClass(active: boolean) {
  return `absolute inset-0 flex flex-col justify-end px-5 md:px-10 pb-16 md:pb-24 transition-all duration-700 ease-out ${
    active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
  }`;
}

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [chapter, setChapter] = useState(0);
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
    let currentChapter = 0;

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
            end: () => `+=${window.innerHeight * 4.5}`,
            pin: true,
            scrub: 0.5,
            onUpdate: (self) => {
              renderFrame(self.progress * (frameCount - 1));
              const next = Math.min(
                CHAPTER_COUNT - 1,
                Math.floor(self.progress * CHAPTER_COUNT),
              );
              if (next !== currentChapter) {
                currentChapter = next;
                setChapter(next);
              }
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
            <Link href="/order" className="btn btn-primary self-start mt-6">
              Tara, Kape? →
            </Link>
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
            <Link href="/order" className="btn btn-primary self-start mt-5">
              Tara, Kape? →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative w-full h-[100svh] overflow-hidden bg-neutral-900">
      {background}

      <div className={chapterClass(revealed && chapter === 0)}>
        <h1 className="text-[40px] md:text-[62px] leading-[1.04] tracking-tight text-neutral-100">
          Kape at
          <br />
          Kwentuhan
        </h1>
        <p className="text-base leading-relaxed mt-4.5 max-w-[42ch] text-neutral-100/85">
          A small coffee shop in Bay, Laguna. Slow drinks, long
          conversations, open until the streets go quiet.
        </p>
        <Link href="/order" className="btn btn-primary self-start mt-6">
          Tara, Kape? →
        </Link>
      </div>

      <div className={chapterClass(chapter === 1)}>
        <div className="max-w-[46ch]">
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
      </div>

      <div className={chapterClass(chapter === 2)}>
        <p className="text-2xl md:text-3xl text-neutral-100 leading-snug max-w-[20ch]">
          Bring your barkada, your notebook, or nothing at all.
        </p>
        <Link href="/order" className="btn btn-primary self-start mt-6">
          Tara, Kape? →
        </Link>
      </div>
    </section>
  );
}

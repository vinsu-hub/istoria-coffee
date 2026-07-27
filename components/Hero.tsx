"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const DESKTOP_FRAME_COUNT = 120;
const MOBILE_FRAME_COUNT = 60;
const MOBILE_BREAKPOINT = 768;

function frameSrc(isMobile: boolean, index: number): string {
  const folder = isMobile ? "mobile" : "desktop";
  const num = String(index + 1).padStart(3, "0");
  return `/images/hero-sequence/${folder}/${num}.webp`;
}

function drawCover(
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

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const frameCount = isMobile ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    let currentFrame = 0;
    let cancelled = false;
    let trigger: import("gsap/ScrollTrigger").ScrollTrigger | undefined;

    function resizeCanvas() {
      if (!canvas || !section) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = section.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx?.scale(dpr, dpr);
      const img = images[currentFrame];
      if (img?.complete) drawCover(ctx!, img, rect.width, rect.height);
    }

    function renderFrame(index: number) {
      const img = images[index];
      if (!img || !img.complete || !canvas) return;
      currentFrame = index;
      const dpr = window.devicePixelRatio || 1;
      drawCover(ctx!, img, canvas.width / dpr, canvas.height / dpr);
    }

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = frameSrc(isMobile, i);
      img.onload = () => {
        if (cancelled) return;
        loadedCount++;
        if (i === 0) renderFrame(0);
        if (loadedCount === frameCount) setLoaded(true);
      };
      images.push(img);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // gsap/ScrollTrigger are dynamically imported so they ship in a separate
    // chunk rather than bloating the page's main JS bundle and hydration cost.
    import("gsap").then(({ default: gsap }) =>
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 3}`,
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            const index = Math.min(frameCount - 1, Math.floor(self.progress * frameCount));
            renderFrame(index);
          },
        });
      }),
    );

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeCanvas);
      trigger?.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-[100svh] overflow-hidden bg-neutral-900">
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
      <div className="absolute inset-0 flex flex-col justify-end px-5 md:px-10 pb-16 md:pb-24 bg-gradient-to-t from-neutral-900/55 via-transparent to-transparent">
        <h1 className="text-[40px] md:text-[62px] leading-[1.04] tracking-tight text-neutral-100">
          Kape at
          <br />
          Kwentuhan
        </h1>
        <p className="text-base leading-relaxed mt-4.5 max-w-[42ch] text-neutral-100/85">
          A small coffee shop in Bay, Laguna. Slow drinks, long
          conversations, open until the streets go quiet.
        </p>
        <Link
          href="/order"
          className="btn btn-primary self-start mt-6"
        >
          Tara, Kape? →
        </Link>
      </div>
    </section>
  );
}

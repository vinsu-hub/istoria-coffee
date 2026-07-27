import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { frameUrls, TOTAL_FRAMES } from "@/lib/frames";

/**
 * Hero — Scroll-scrubbed cup collision animation.
 * 145 frames extracted from the owner's video (24fps, 1200x675).
 * Uses a sticky canvas that stays pinned during the scroll,
 * while the scroll position maps to frame index 0–144.
 *
 * Layout: section height = (HERO_SCROLL_VH - 1) * 100vh.
 * The canvas container is sticky at top:0, height:100vh.
 * As you scroll through the section, progress = (0 to 1)
 * maps to frame index = (0 to TOTAL_FRAMES-1).
 *
 * While frames are still preloading, a fading logo + tagline placeholder
 * is shown instead of the (still-invisible) canvas — only the nav bar
 * appears immediately. Once the first frame is ready it auto-fades in.
 *
 * The first deliberate scroll/wheel input inside the hero hands control
 * to an auto-scroll driver that smoothly carries the page the rest of
 * the way to the last frame, instead of requiring the user to keep
 * scrolling manually through all 145 frames.
 */

const HERO_SCROLL_VH = 500; // total viewport heights for animation = 500vh = 5x viewport scroll
const SCROLL_SENSITIVITY = 1.02; // +2% sensitivity — reaches the last frame slightly before the nominal scroll distance
const SCROLL_GUIDE_FRAME_CUTOFF = 10; // thin scroll-down guide shows only for the first N frames
const MOTION_BLUR_PROGRESS_CUTOFF = 0.5; // motion blur only applied in the first half of the animation
const MAX_BLUR_PX = 3; // reduced for a subtler effect
const BLUR_SCALE = 0.45; // reduced alongside MAX_BLUR_PX
const EASE_FACTOR = 0.12; // how much of the remaining distance to the target frame is closed each animation tick (higher = snappier, lower = smoother/slower)
const SNAP_EPSILON = 0.05; // once this close to the target frame, snap exactly instead of asymptotically crawling forever

const AUTO_SCROLL_PX_PER_SEC = 1600; // stable, constant auto-scroll speed once triggered
const AUTO_SCROLL_MIN_MS = 900;
const AUTO_SCROLL_MAX_MS = 3200;
const AUTO_SCROLL_ARRIVE_PROGRESS = 0.995; // don't auto-trigger again once basically at the end

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const imageCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef(0); // last drawn (rounded) frame index
  const displayFrameRef = useRef(0); // eased, fractional frame position — what's actually being animated toward the target
  const rafIdRef = useRef<number | null>(null);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showScrollGuide, setShowScrollGuide] = useState(true);
  const animationComplete = useRef(false);
  const scrollGuideVisibleRef = useRef(true);
  const touchStartYRef = useRef<number | null>(null);

  // Auto-scroll-to-end driver state
  const autoScrollRef = useRef<{
    active: boolean;
    startY: number;
    targetY: number;
    startTime: number;
    duration: number;
    rafId: number | null;
  }>({ active: false, startY: 0, targetY: 0, startTime: 0, duration: 0, rafId: null });

  // Resize canvas to match container dimensions with DPR scaling
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
  }, []);

  // Draw frame to canvas, optionally with a motion-blur filter
  const drawFrame = useCallback((frameIndex: number, blurPx = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageCache.current.get(frameIndex);
    if (!img || !img.complete) return;

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width;
    const h = rect.height;

    // "object-cover" behavior: scale to fill, center-crop
    const scaleX = w / 1200;
    const scaleY = h / 675;
    const scale = Math.max(scaleX, scaleY);
    const drawW = 1200 * scale;
    const drawH = 675 * scale;
    const offsetX = (w - drawW) / 2;
    const offsetY = (h - drawH) / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.filter = blurPx > 0.1 ? `blur(${blurPx}px)` : "none";
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.filter = "none";
  }, []);

  // Preload frames in background — cached by the browser for next visits
  useEffect(() => {
    let mounted = true;

    // Priority: first, middle, last frame for instant display
    const priorityFrames = [0, Math.floor(TOTAL_FRAMES / 2), TOTAL_FRAMES - 1];
    for (const idx of priorityFrames) {
      const img = new Image();
      img.onload = () => {
        if (!mounted) return;
        imageCache.current.set(idx, img);
        if (idx === 0) {
          drawFrame(0);
          // Let the browser paint the drawn frame before fading it in,
          // so it eases into view instead of popping up already-visible.
          requestAnimationFrame(() => setFirstFrameReady(true));
        }
      };
      img.src = frameUrls[idx];
    }

    // Preload the rest of the sequence progressively
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (priorityFrames.includes(i)) continue;
      const img = new Image();
      img.onload = () => {
        if (!mounted) return;
        imageCache.current.set(i, img);
      };
      img.src = frameUrls[i];
    }

    return () => {
      mounted = false;
    };
  }, [drawFrame]);

  // Continuous easing loop — scroll position sets a *target* frame, and the
  // displayed frame glides toward it a little each tick instead of jumping
  // straight to it, so fast/jerky scrolling reads as a smooth, controlled
  // scrub all the way through to the last frame.
  useEffect(() => {
    const tick = () => {
      rafIdRef.current = requestAnimationFrame(tick);

      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // The section is (HERO_SCROLL_VH - 1) * vh tall.
      // When section top = 0, progress = 0.
      // When section bottom reaches viewport bottom, progress = 1.
      const sectionHeight = rect.height;
      const scrollableDistance = sectionHeight - viewportHeight;

      if (scrollableDistance <= 0) return;

      const scrolled = -rect.top;
      // +2% scroll sensitivity — completes the sequence slightly before
      // the nominal scroll distance, reducing perceived travel.
      const progress = Math.max(0, Math.min(1, (scrolled / scrollableDistance) * SCROLL_SENSITIVITY));
      const targetFrame = progress * (TOTAL_FRAMES - 1);

      const current = displayFrameRef.current;
      const remaining = targetFrame - current;
      const next = Math.abs(remaining) < SNAP_EPSILON ? targetFrame : current + remaining * EASE_FACTOR;
      displayFrameRef.current = next;

      const frameIndex = Math.round(next);
      if (frameIndex !== currentFrameRef.current) {
        // Blur scales with how far the eased position still lags the
        // scroll target — naturally strongest during fast scrolling and
        // fading out on its own as the ease catches up, no extra timers.
        const applyBlur = progress < MOTION_BLUR_PROGRESS_CUTOFF;
        const blurPx = applyBlur ? Math.min(MAX_BLUR_PX, Math.abs(remaining) * BLUR_SCALE) : 0;

        currentFrameRef.current = frameIndex;
        drawFrame(frameIndex, blurPx);
      }

      // Thin scroll-down guide — only during the first few frames
      const shouldShowGuide = frameIndex < SCROLL_GUIDE_FRAME_CUTOFF;
      if (shouldShowGuide !== scrollGuideVisibleRef.current) {
        scrollGuideVisibleRef.current = shouldShowGuide;
        setShowScrollGuide(shouldShowGuide);
      }

      // Show text overlay after animation completes (last 15% of scroll)
      if (progress > 0.92 && !animationComplete.current) {
        animationComplete.current = true;
        setShowContent(true);
      } else if (progress < 0.88) {
        animationComplete.current = false;
        setShowContent(false);
      }
    };

    // Initial draw of frame 0
    drawFrame(0);
    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [drawFrame]);

  // Resize observer + initial setup
  useEffect(() => {
    resizeCanvas();
    drawFrame(currentFrameRef.current);

    const observer = new ResizeObserver(() => {
      resizeCanvas();
      drawFrame(currentFrameRef.current);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [resizeCanvas, drawFrame]);

  // Auto-scroll-to-end: the first forward scroll/wheel gesture inside the
  // hero's pinned range takes over and smoothly carries the page all the
  // way to the last frame, at a constant, stable speed. An upward gesture
  // while it's running cancels it immediately, handing control back.
  useEffect(() => {
    const stopAutoScroll = () => {
      const state = autoScrollRef.current;
      if (state.rafId !== null) cancelAnimationFrame(state.rafId);
      state.active = false;
      state.rafId = null;
    };

    const runAutoScroll = () => {
      const state = autoScrollRef.current;
      const now = performance.now();
      const elapsed = now - state.startTime;
      const t = Math.min(1, elapsed / state.duration);
      const y = state.startY + (state.targetY - state.startY) * easeInOutQuad(t);
      window.scrollTo(0, y);

      if (t >= 1) {
        stopAutoScroll();
        return;
      }
      state.rafId = requestAnimationFrame(runAutoScroll);
    };

    const startAutoScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollableDistance = rect.height - viewportHeight;
      if (scrollableDistance <= 0) return;

      const sectionAbsoluteTop = window.scrollY + rect.top;
      const targetY = sectionAbsoluteTop + scrollableDistance / SCROLL_SENSITIVITY;
      const startY = window.scrollY;
      const distance = Math.abs(targetY - startY);
      if (distance < 2) return;

      const duration = Math.min(
        AUTO_SCROLL_MAX_MS,
        Math.max(AUTO_SCROLL_MIN_MS, (distance / AUTO_SCROLL_PX_PER_SEC) * 1000)
      );

      const state = autoScrollRef.current;
      state.active = true;
      state.startY = startY;
      state.targetY = targetY;
      state.startTime = performance.now();
      state.duration = duration;
      if (state.rafId !== null) cancelAnimationFrame(state.rafId);
      state.rafId = requestAnimationFrame(runAutoScroll);
    };

    const isInsideHeroRange = () => {
      if (!sectionRef.current) return false;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollableDistance = rect.height - viewportHeight;
      if (scrollableDistance <= 0) return false;
      const scrolled = -rect.top;
      // Must match the tick loop's progress formula (with sensitivity
      // applied) — otherwise "finished" here and "finished" there disagree
      // and forward scroll past the end gets stuck re-triggering forever.
      const progress = (scrolled / scrollableDistance) * SCROLL_SENSITIVITY;
      return progress > -0.01 && progress < AUTO_SCROLL_ARRIVE_PROGRESS;
    };

    const handleWheel = (e: WheelEvent) => {
      const state = autoScrollRef.current;

      if (state.active) {
        // Upward gesture cancels — hand control back to the user immediately.
        if (e.deltaY < -4) {
          stopAutoScroll();
          return;
        }
        // Already auto-scrolling forward — swallow further input so it
        // doesn't fight the programmatic scroll.
        e.preventDefault();
        return;
      }

      if (e.deltaY > 0 && isInsideHeroRange()) {
        e.preventDefault();
        startAutoScroll();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const state = autoScrollRef.current;
      const startYTouch = touchStartYRef.current;
      if (startYTouch === null) return;
      const currentY = e.touches[0]?.clientY ?? startYTouch;
      const delta = startYTouch - currentY; // positive = swiping up = scrolling down

      if (state.active) {
        if (delta < -4) {
          stopAutoScroll();
          return;
        }
        e.preventDefault();
        return;
      }

      if (delta > 4 && isInsideHeroRange()) {
        e.preventDefault();
        startAutoScroll();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      stopAutoScroll();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${HERO_SCROLL_VH}vh` }}
    >
      <div
        ref={containerRef}
        className="sticky top-0 h-screen overflow-hidden bg-white"
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{
            opacity: firstFrameReady ? 1 : 0,
            transition: "opacity 0.9s ease-out",
          }}
        />

        {/* Loading placeholder — logo + tagline, pulsing while frames preload in the background */}
        <div
          className="absolute inset-0 bg-white flex items-center justify-center z-10 pointer-events-none"
          style={{
            opacity: firstFrameReady ? 0 : 1,
            transition: "opacity 0.6s ease-out",
          }}
        >
          <div
            className="flex flex-col items-center gap-4"
            style={{ animation: "fade-in-out 2.4s ease-in-out infinite" }}
          >
            <img src="/brand/logo.png" alt="Istoria Coffee" className="w-24 h-24 sm:w-28 sm:h-28" />
            <p className="font-accent text-2xl sm:text-3xl text-charcoal-light italic">
              Tara kape?
            </p>
          </div>
        </div>

        {/* Thin scroll-down guide — visible only for the first few frames */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
          style={{
            opacity: firstFrameReady && showScrollGuide ? 0.6 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <span className="font-body text-[10px] tracking-[0.25em] uppercase text-charcoal-light/70">
            Scroll
          </span>
          <span className="relative block w-px h-10 overflow-hidden bg-gradient-to-b from-charcoal-light/60 via-charcoal-light/30 to-transparent">
            <span className="absolute inset-x-0 top-0 h-2 bg-charcoal-light/80 animate-pulse" />
          </span>
        </div>

        {/* Text overlay — fades in after animation completes */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none"
          style={{
            opacity: showContent ? 1 : 0,
            transition: "opacity 0.6s ease-out",
          }}
        >
          {/* Gradient for text readability over the splash */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />

          <div className="relative z-10 container text-center">
            <p className="font-accent text-xl sm:text-2xl text-charcoal-light mb-3">
              Kape at Kwentuhan
            </p>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-charcoal leading-[1.1] mb-6">
              Where every cup
              <br />
              <span className="italic font-normal">tells a story</span>
            </h1>

            <p className="font-body text-base sm:text-lg text-charcoal-light max-w-md mx-auto mb-8 leading-relaxed">
              Brgy. Maitim, Bay, Laguna — your neighborhood café for coffee,
              connection, and good vibes.
            </p>

            <Link
              href="/order"
              className="inline-flex items-center gap-2 bg-espresso text-warm-white px-8 py-4 rounded-full text-base font-body font-medium hover:bg-espresso-light transition-all duration-200 active:scale-[0.97] pointer-events-auto"
            >
              Order now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <div className="mt-6">
              <Link
                href="/menu"
                className="font-body text-sm text-charcoal-light hover:text-espresso transition-colors underline underline-offset-4 decoration-1 pointer-events-auto"
              >
                View our menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

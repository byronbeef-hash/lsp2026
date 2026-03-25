"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Tour Step Definitions ──────────────────────────────────────────────────

interface TourStep {
  /** CSS selector to find the target element */
  selector: string;
  /** Fallback position if selector not found (percentage-based) */
  fallback: { top: number; left: number; width: number; height: number };
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Tooltip placement relative to spotlight */
  placement: "bottom" | "top" | "left" | "right" | "center";
  /** Whether this is a center overlay step (no spotlight) */
  isOverlay?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: "[data-tour='welcome']",
    fallback: { top: 30, left: 25, width: 50, height: 40 },
    title: "Welcome to LiveStock Manager!",
    description:
      "Let's take a quick tour of your farm management dashboard. We'll show you the key features to help you get the most out of the app.",
    placement: "center",
    isOverlay: true,
  },
  {
    selector: "nav[role='navigation']",
    fallback: { top: 1, left: 1, width: 98, height: 5 },
    title: "Navigation Bar",
    description:
      "Use the top navigation to switch between modules \u2014 Dashboard, Livestock, Medical, Paddocks, Maps, and more.",
    placement: "bottom",
  },
  {
    selector: "a[href='/ai-advisor'], a[href='/scanner']",
    fallback: { top: 1.5, left: 70, width: 12, height: 4 },
    title: "AI & Scan Buttons",
    description:
      "Quick access to the AI Farm Advisor and EID Scanner & Scales.",
    placement: "bottom",
  },
  {
    selector: "button[aria-label='Display settings']",
    fallback: { top: 1.5, left: 82, width: 4, height: 4 },
    title: "Theme Toggle",
    description:
      "Switch between dark navy and light neutral themes. You can also adjust brightness, panel opacity, and custom background colours.",
    placement: "bottom",
  },
  {
    selector: "button[aria-label='All modules']",
    fallback: { top: 1.5, left: 86, width: 4, height: 4 },
    title: "Mega Menu",
    description:
      "Access all modules from the mega menu \u2014 Calendar, Supplies, Sales, Rain Gauge, and more.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='herd-stats']",
    fallback: { top: 12, left: 2, width: 96, height: 12 },
    title: "Herd Stats",
    description:
      "Your herd at a glance \u2014 total livestock, average weight, estimated herd value based on live MLA market prices, and weight gain trends.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='herd-breakdown']",
    fallback: { top: 26, left: 2, width: 96, height: 18 },
    title: "Herd Breakdown",
    description:
      "See your herd broken down by category \u2014 Cows, Bulls, Weaners, Steers, and Heifers with average weights and dollar values per head.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='weight-trend']",
    fallback: { top: 46, left: 2, width: 48, height: 22 },
    title: "Weight Trend",
    description:
      "Track your herd's 6-month weight trend to spot growth patterns and feed efficiency.",
    placement: "right",
  },
  {
    selector: "[data-tour='breed-distribution']",
    fallback: { top: 46, left: 50, width: 48, height: 22 },
    title: "Breed Distribution",
    description: "View breed distribution across your entire herd.",
    placement: "left",
  },
  {
    selector: "button[title='Open sidebar']",
    fallback: { top: 45, left: 0, width: 3, height: 8 },
    title: "Side Menu",
    description:
      "Expand the side menu for quick navigation to all modules including AI Advisor, EID Scanner, and more.",
    placement: "right",
  },
  {
    selector: "button:has(.lucide-chevron-down)",
    fallback: { top: 1.5, left: 92, width: 7, height: 4 },
    title: "Profile Menu",
    description:
      "Access your profile, settings, and sign out from here.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='get-started']",
    fallback: { top: 30, left: 25, width: 50, height: 40 },
    title: "You're All Set!",
    description:
      "Explore the dashboard or click any module to dive deeper. Happy farming!",
    placement: "center",
    isOverlay: true,
  },
];

const STORAGE_KEY = "livestock-tour-completed";

// ─── Component ──────────────────────────────────────────────────────────────

export function ProductTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Launch tour on first visit
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for restart event (from Settings page)
  useEffect(() => {
    const handler = () => {
      setCurrentStep(0);
      setIsActive(true);
    };
    window.addEventListener("restart-product-tour", handler);
    return () => window.removeEventListener("restart-product-tour", handler);
  }, []);

  // Update spotlight rect when step changes
  const updateSpotlight = useCallback(() => {
    if (!isActive) return;

    const s = TOUR_STEPS[currentStep];
    if (s.isOverlay) {
      setSpotlightRect(null);
      setTooltipVisible(true);
      return;
    }

    // Try multiple selectors (comma-separated)
    const selectors = s.selector.split(",").map((sel) => sel.trim());
    let elements: Element[] = [];
    for (const sel of selectors) {
      try {
        const found = document.querySelectorAll(sel);
        if (found.length) elements.push(...Array.from(found));
      } catch {
        // invalid selector, skip
      }
    }

    if (elements.length > 0) {
      // Combine bounding rects of all matched elements
      const rects = elements.map((el) => el.getBoundingClientRect());
      const combined = new DOMRect(
        Math.min(...rects.map((r) => r.left)) - 8,
        Math.min(...rects.map((r) => r.top)) - 8,
        Math.max(...rects.map((r) => r.right)) -
          Math.min(...rects.map((r) => r.left)) +
          16,
        Math.max(...rects.map((r) => r.bottom)) -
          Math.min(...rects.map((r) => r.top)) +
          16
      );
      setSpotlightRect(combined);
    } else {
      // Fallback to percentage-based position
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fb = s.fallback;
      setSpotlightRect(
        new DOMRect(
          (fb.left / 100) * vw,
          (fb.top / 100) * vh,
          (fb.width / 100) * vw,
          (fb.height / 100) * vh
        )
      );
    }

    // Delay showing tooltip for animation
    setTimeout(() => setTooltipVisible(true), 100);
  }, [isActive, currentStep]);

  useEffect(() => {
    setTooltipVisible(false);
    setIsAnimating(true);

    const timer = setTimeout(() => {
      updateSpotlight();
      setIsAnimating(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [currentStep, isActive, updateSpotlight]);

  // Recompute on resize/scroll
  useEffect(() => {
    if (!isActive) return;
    const onResize = () => updateSpotlight();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [isActive, updateSpotlight]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip();
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handleBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsActive(false);
    setCurrentStep(0);
  };

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, "true");
    } else {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setIsActive(false);
    setCurrentStep(0);
  };

  if (!isActive) return null;

  // ─── Tooltip position calculation ──────────────────────────────────────────

  const getTooltipStyle = (): React.CSSProperties => {
    const tooltipWidth = 380;
    const tooltipGap = 16;

    if (step.isOverlay || !spotlightRect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: tooltipWidth,
        maxWidth: "90vw",
      };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = spotlightRect;

    let top: number;
    let left: number;

    switch (step.placement) {
      case "bottom":
        top = r.bottom + tooltipGap;
        left = r.left + r.width / 2 - tooltipWidth / 2;
        break;
      case "top":
        top = r.top - tooltipGap - 200; // estimate tooltip height
        left = r.left + r.width / 2 - tooltipWidth / 2;
        break;
      case "right":
        top = r.top + r.height / 2 - 80;
        left = r.right + tooltipGap;
        break;
      case "left":
        top = r.top + r.height / 2 - 80;
        left = r.left - tooltipGap - tooltipWidth;
        break;
      default:
        top = r.bottom + tooltipGap;
        left = r.left + r.width / 2 - tooltipWidth / 2;
    }

    // Clamp to viewport
    left = Math.max(16, Math.min(left, vw - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, vh - 260));

    return {
      position: "fixed",
      top,
      left,
      width: tooltipWidth,
      maxWidth: "90vw",
    };
  };

  // ─── Spotlight overlay using box-shadow ────────────────────────────────────

  const getOverlayStyle = (): React.CSSProperties => {
    if (step.isOverlay || !spotlightRect) {
      return {
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.70)",
        zIndex: 9998,
      };
    }

    const r = spotlightRect;
    return {
      position: "fixed",
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
      borderRadius: 16,
      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)",
      zIndex: 9998,
      pointerEvents: "none",
    };
  };

  return (
    <>
      {/* Overlay / Spotlight */}
      <div
        style={{
          ...getOverlayStyle(),
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={(e) => {
          // Only close if clicking the full overlay (not spotlight)
          if (step.isOverlay) return;
          e.stopPropagation();
        }}
      />

      {/* Click-blocker behind tooltip but above page */}
      {!step.isOverlay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9997,
            cursor: "default",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          ...getTooltipStyle(),
          zIndex: 9999,
          opacity: tooltipVisible && !isAnimating ? 1 : 0,
          transform: `${
            step.isOverlay || !spotlightRect
              ? "translate(-50%, -50%)"
              : ""
          } ${tooltipVisible && !isAnimating ? "translateY(0) scale(1)" : "translateY(8px) scale(0.97)"}`,
          transition:
            "opacity 0.3s ease-out, transform 0.3s ease-out",
        }}
      >
        <div className="bg-[#000040]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-6 relative">
          {/* Step indicator */}
          {!step.isOverlay && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Skip tour
              </button>
            </div>
          )}

          {/* Welcome/Finish logo */}
          {step.isOverlay && (
            <div className="flex justify-center mb-4">
              {isFirstStep ? (
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-white.png"
                    alt="LiveStock Manager"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-5xl">&#x1F404;</div>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2">
            {step.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-white/70 leading-relaxed mb-5">
            {step.description}
          </p>

          {/* Don't show again checkbox (last step only) */}
          {isLastStep && (
            <label className="flex items-center gap-2 mb-4 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                  dontShowAgain
                    ? "bg-white/20 border-white/40"
                    : "border-white/30 group-hover:border-white/50"
                }`}
                onClick={() => setDontShowAgain(!dontShowAgain)}
              >
                {dontShowAgain && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors select-none">
                Don&apos;t show this tour again
              </span>
            </label>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <div>
              {!isFirstStep && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isFirstStep && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-sm font-medium text-white/40 hover:text-white/70 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600/80 hover:bg-blue-500/90 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                {isFirstStep
                  ? "Start Tour"
                  : isLastStep
                  ? "Finish"
                  : "Next"}
              </button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "w-5 h-1.5 bg-white"
                    : idx < currentStep
                    ? "w-1.5 h-1.5 bg-white/50"
                    : "w-1.5 h-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

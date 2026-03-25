"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ClickEvent {
  type: "click";
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  path: string;
  timestamp: number;
  tag: string;
  className: string;
  text: string;
}

interface PageVisit {
  type: "pageview";
  path: string;
  timestamp: number;
  referrer: string;
  viewportWidth: number;
  viewportHeight: number;
}

interface SessionInfo {
  type: "session";
  visitorId: string;
  sessionId: string;
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
  startTime: number;
}

type AnalyticsEvent = ClickEvent | PageVisit | SessionInfo;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/lsp-visitor-id=([^;]+)/);
  if (match) return match[1];
  const id = generateUUID();
  document.cookie = `lsp-visitor-id=${id};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  return id;
}

function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return "";
  let id = sessionStorage.getItem("lsp-session-id");
  if (!id) {
    id = generateUUID();
    sessionStorage.setItem("lsp-session-id", id);
  }
  return id;
}

function detectBrowser(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function detectOS(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  return "Other";
}

const STORAGE_KEY = "lsp-analytics";
const BATCH_INTERVAL = 10_000; // 10 seconds

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Analytics() {
  const pathname = usePathname();
  const bufferRef = useRef<AnalyticsEvent[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Flush buffered events
  const flush = useCallback(() => {
    if (bufferRef.current.length === 0) return;

    const events = [...bufferRef.current];
    bufferRef.current = [];

    // Append to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const updated = [...existing, ...events];
      // Cap at 5000 events to prevent localStorage overflow
      const capped = updated.slice(-5000);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    } catch {
      // Storage full or unavailable — silently drop
    }

    // Mock API call
    console.log("[Analytics] Would POST to /api/analytics:", events.length, "events");
  }, []);

  // Record a single event
  const record = useCallback((event: AnalyticsEvent) => {
    bufferRef.current.push(event);
  }, []);

  // Session start — runs once
  useEffect(() => {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    record({
      type: "session",
      visitorId,
      sessionId,
      browser: detectBrowser(),
      os: detectOS(),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      startTime: Date.now(),
    });

    // Batch flush on interval
    timerRef.current = setInterval(flush, BATCH_INTERVAL);

    // Flush on unload
    const handleUnload = () => flush();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener("beforeunload", handleUnload);
      flush();
    };
  }, [record, flush]);

  // Page visit tracking
  useEffect(() => {
    record({
      type: "pageview",
      path: pathname,
      timestamp: Date.now(),
      referrer: typeof document !== "undefined" ? document.referrer : "",
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
  }, [pathname, record]);

  // Click tracking
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const x = (e.clientX / window.innerWidth) * 100;
      const y = ((e.clientY + window.scrollY) / document.documentElement.scrollHeight) * 100;

      record({
        type: "click",
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        path: pathname,
        timestamp: Date.now(),
        tag: target.tagName.toLowerCase(),
        className: (target.className && typeof target.className === "string")
          ? target.className.slice(0, 100)
          : "",
        text: (target.textContent || "").slice(0, 50).trim(),
      });
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [pathname, record]);

  return null; // Invisible tracking component
}

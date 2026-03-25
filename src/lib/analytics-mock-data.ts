// ---------------------------------------------------------------------------
// Mock analytics data for the analytics dashboard demo
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Seeded random for reproducibility
// ---------------------------------------------------------------------------
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CITIES: { city: string; flag: string }[] = [
  { city: "Sydney", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
  { city: "Melbourne", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
  { city: "Brisbane", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
  { city: "Nimbin", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
  { city: "Lismore", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
  { city: "Byron Bay", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
  { city: "Grafton", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
  { city: "Casino", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
  { city: "Ballina", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
  { city: "Coffs Harbour", flag: "\uD83C\uDDE6\uD83C\uDDFA" },
];

const BROWSERS = ["Chrome", "Safari", "Firefox", "Chrome", "Chrome", "Safari"];
const OS_LIST = ["macOS", "Windows", "iOS", "Android", "macOS", "Windows"];
const DEVICES = ["Desktop", "Desktop", "Desktop", "Mobile", "Mobile", "Tablet"];

const PAGES = [
  "/",
  "/records",
  "/medical",
  "/paddocks",
  "/maps",
  "/climate",
  "/markets",
  "/finance",
  "/reports",
  "/settings",
  "/calendar",
  "/supplies",
  "/sales",
  "/todo",
  "/farms",
];

// Areas where clicks are likely on a livestock management app
const CLICK_ZONES = [
  // Nav bar area (top)
  { xMin: 0, xMax: 100, yMin: 0, yMax: 5, weight: 3 },
  // Sidebar area (left)
  { xMin: 0, xMax: 15, yMin: 5, yMax: 80, weight: 2 },
  // Main content area buttons/cards
  { xMin: 15, xMax: 85, yMin: 10, yMax: 35, weight: 5 },
  // Middle content
  { xMin: 15, xMax: 85, yMin: 35, yMax: 60, weight: 4 },
  // Lower content
  { xMin: 15, xMax: 85, yMin: 60, yMax: 85, weight: 2 },
  // Bottom nav (mobile)
  { xMin: 0, xMax: 100, yMin: 90, yMax: 100, weight: 2 },
];

const RESOLUTIONS = [
  { w: 1920, h: 1080 },
  { w: 1440, h: 900 },
  { w: 1366, h: 768 },
  { w: 390, h: 844 },
  { w: 414, h: 896 },
  { w: 768, h: 1024 },
  { w: 1536, h: 864 },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface MockVisitor {
  visitorId: string;
  city: string;
  flag: string;
  browser: string;
  os: string;
  device: string;
  screenWidth: number;
  screenHeight: number;
  sessions: MockSession[];
}

export interface MockSession {
  sessionId: string;
  startTime: number;
  duration: number; // ms
  pageViews: MockPageView[];
  clicks: MockClick[];
}

export interface MockPageView {
  path: string;
  timestamp: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface MockClick {
  x: number;
  y: number;
  path: string;
  timestamp: number;
  tag: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------
function generateVisitorId(): string {
  const chars = "0123456789abcdef";
  let id = "";
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) id += "-";
    id += chars[Math.floor(rand() * 16)];
  }
  return id;
}

function generateClicks(path: string, baseTime: number, count: number): MockClick[] {
  const clicks: MockClick[] = [];
  const tags = ["button", "a", "div", "span", "input", "svg", "li"];
  const texts = [
    "Dashboard", "View", "Add Record", "Save", "Edit", "Delete",
    "Search", "Filter", "Export", "Next", "Back", "Submit",
    "Livestock", "Medical", "Maps", "Reports", "Settings",
  ];

  for (let i = 0; i < count; i++) {
    // Pick a weighted zone
    const totalWeight = CLICK_ZONES.reduce((s, z) => s + z.weight, 0);
    let r = rand() * totalWeight;
    let zone = CLICK_ZONES[0];
    for (const z of CLICK_ZONES) {
      r -= z.weight;
      if (r <= 0) { zone = z; break; }
    }

    clicks.push({
      x: Math.round((zone.xMin + rand() * (zone.xMax - zone.xMin)) * 100) / 100,
      y: Math.round((zone.yMin + rand() * (zone.yMax - zone.yMin)) * 100) / 100,
      path,
      timestamp: baseTime + randInt(1000, 30000),
      tag: pick(tags),
      text: pick(texts),
    });
  }

  return clicks;
}

function generateMockData(): MockVisitor[] {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const visitors: MockVisitor[] = [];

  for (let v = 0; v < 25; v++) {
    const cityInfo = pick(CITIES);
    const res = pick(RESOLUTIONS);
    const browserIdx = Math.floor(rand() * BROWSERS.length);

    const visitor: MockVisitor = {
      visitorId: generateVisitorId(),
      city: cityInfo.city,
      flag: cityInfo.flag,
      browser: BROWSERS[browserIdx],
      os: OS_LIST[browserIdx],
      device: DEVICES[browserIdx],
      screenWidth: res.w,
      screenHeight: res.h,
      sessions: [],
    };

    // 1-3 sessions per visitor
    const sessionCount = randInt(1, 3);
    for (let s = 0; s < sessionCount; s++) {
      const sessionStart = now - Math.floor(rand() * sevenDaysMs);
      const pageCount = randInt(3, 12);
      const pageViews: MockPageView[] = [];
      const allClicks: MockClick[] = [];

      let currentTime = sessionStart;
      // Always start with home
      const visitedPages = ["/"];

      for (let p = 0; p < pageCount; p++) {
        const path = p === 0 ? "/" : pick(PAGES);
        if (p > 0) visitedPages.push(path);
        const viewportW = res.w < 500 ? res.w : randInt(1024, res.w);
        const viewportH = res.h < 600 ? res.h : randInt(600, res.h);

        pageViews.push({
          path,
          timestamp: currentTime,
          viewportWidth: viewportW,
          viewportHeight: viewportH,
        });

        // 2-8 clicks per page
        const clickCount = randInt(2, 8);
        allClicks.push(...generateClicks(path, currentTime, clickCount));

        currentTime += randInt(5000, 60000);
      }

      const duration = currentTime - sessionStart;

      visitor.sessions.push({
        sessionId: generateVisitorId(),
        startTime: sessionStart,
        duration,
        pageViews,
        clicks: allClicks,
      });
    }

    visitors.push(visitor);
  }

  return visitors;
}

// ---------------------------------------------------------------------------
// Export singleton
// ---------------------------------------------------------------------------
export const mockAnalyticsData = generateMockData();

// ---------------------------------------------------------------------------
// Derived stats helpers
// ---------------------------------------------------------------------------
export function getAnalyticsStats() {
  const visitors = mockAnalyticsData;
  const totalVisitors = visitors.length;
  const totalSessions = visitors.reduce((s, v) => s + v.sessions.length, 0);
  const totalPageViews = visitors.reduce(
    (s, v) => s + v.sessions.reduce((ss, se) => ss + se.pageViews.length, 0),
    0
  );
  const avgSessionDuration =
    visitors.reduce(
      (s, v) => s + v.sessions.reduce((ss, se) => ss + se.duration, 0),
      0
    ) / totalSessions;

  // Page view counts
  const pageViewCounts: Record<string, number> = {};
  for (const v of visitors) {
    for (const se of v.sessions) {
      for (const pv of se.pageViews) {
        pageViewCounts[pv.path] = (pageViewCounts[pv.path] || 0) + 1;
      }
    }
  }
  const topPages = Object.entries(pageViewCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // All clicks aggregated
  const allClicks: MockClick[] = [];
  for (const v of visitors) {
    for (const se of v.sessions) {
      allClicks.push(...se.clicks);
    }
  }

  // Clicks per page
  const clicksByPage: Record<string, MockClick[]> = {};
  for (const c of allClicks) {
    if (!clicksByPage[c.path]) clicksByPage[c.path] = [];
    clicksByPage[c.path].push(c);
  }

  // Recent sessions (last 10)
  const allSessions = visitors.flatMap((v) =>
    v.sessions.map((se) => ({
      ...se,
      visitorId: v.visitorId,
      city: v.city,
      flag: v.flag,
      browser: v.browser,
      os: v.os,
      device: v.device,
    }))
  );
  allSessions.sort((a, b) => b.startTime - a.startTime);
  const recentSessions = allSessions.slice(0, 10);

  // Last 10 visitors
  const sortedVisitors = [...visitors].sort((a, b) => {
    const aLast = Math.max(...a.sessions.map((s) => s.startTime));
    const bLast = Math.max(...b.sessions.map((s) => s.startTime));
    return bLast - aLast;
  });
  const recentVisitors = sortedVisitors.slice(0, 10);

  // Page flow data
  const flowTransitions: Record<string, Record<string, number>> = {};
  for (const v of visitors) {
    for (const se of v.sessions) {
      for (let i = 0; i < se.pageViews.length - 1; i++) {
        const from = se.pageViews[i].path;
        const to = se.pageViews[i + 1].path;
        if (!flowTransitions[from]) flowTransitions[from] = {};
        flowTransitions[from][to] = (flowTransitions[from][to] || 0) + 1;
      }
    }
  }

  // Entry pages
  const entryPages: Record<string, number> = {};
  for (const v of visitors) {
    for (const se of v.sessions) {
      if (se.pageViews.length > 0) {
        const entry = se.pageViews[0].path;
        entryPages[entry] = (entryPages[entry] || 0) + 1;
      }
    }
  }

  // Exit pages
  const exitPages: Record<string, number> = {};
  for (const v of visitors) {
    for (const se of v.sessions) {
      if (se.pageViews.length > 0) {
        const exit = se.pageViews[se.pageViews.length - 1].path;
        exitPages[exit] = (exitPages[exit] || 0) + 1;
      }
    }
  }

  return {
    totalVisitors,
    totalSessions,
    totalPageViews,
    avgSessionDuration,
    topPages,
    allClicks,
    clicksByPage,
    recentSessions,
    recentVisitors,
    flowTransitions,
    entryPages,
    exitPages,
    pageViewCounts,
  };
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes < 60) return `${minutes}m ${secs}s`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

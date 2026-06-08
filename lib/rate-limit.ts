import { NextResponse } from "next/server";

// Upstash imports are dynamic so the app still runs without Redis credentials
let Ratelimit: typeof import("@upstash/ratelimit").Ratelimit | null = null;
let Redis: typeof import("@upstash/redis").Redis | null = null;

async function loadUpstash() {
  if (!Ratelimit) {
    Ratelimit = (await import("@upstash/ratelimit")).Ratelimit;
    Redis = (await import("@upstash/redis")).Redis;
  }
}

// Per-route limits: [requests, window]
const LIMITS: Record<string, { requests: number; window: string }> = {
  "parse-resume": { requests: 5, window: "1 m" },
  "generate-cv":  { requests: 5, window: "1 m" },
  "cv-assistant": { requests: 20, window: "1 m" },
  "extract-text": { requests: 10, window: "1 m" },
  "job-intent":   { requests: 15, window: "1 m" },
  "job-detail":   { requests: 15, window: "1 m" },
  "site-guide":   { requests: 20, window: "1 m" },
  "mock-interview": { requests: 20, window: "1 m" },
  "personalize-dashboard-summary": { requests: 15, window: "1 m" },
  "personalize-pathway": { requests: 20, window: "1 m" },
  "personalize-skill-gaps": { requests: 15, window: "1 m" },
  "personalize-outreach": { requests: 20, window: "1 m" },
  default:        { requests: 30, window: "1 m" },
};

const limiters = new Map<string, InstanceType<typeof import("@upstash/ratelimit").Ratelimit>>();

async function getLimiter(route: string) {
  await loadUpstash();
  if (!Ratelimit || !Redis) return null;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null; // Redis not configured — skip rate limiting in dev
  }

  if (!limiters.has(route)) {
    const { requests, window } = LIMITS[route] ?? LIMITS.default;
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    limiters.set(
      route,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
        analytics: true,
      })
    );
  }
  return limiters.get(route)!;
}

/**
 * Check rate limit for a route + identifier (user ID or IP).
 * Returns { limited: true, response } when the limit is hit, otherwise { limited: false }.
 */
export async function checkRateLimit(
  route: string,
  identifier: string
): Promise<{ limited: false } | { limited: true; response: NextResponse }> {
  const limiter = await getLimiter(route);
  if (!limiter) return { limited: false }; // No Redis — allow through

  const { success, limit, remaining, reset } = await limiter.limit(`${route}:${identifier}`);

  if (!success) {
    const response = NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
    response.headers.set("X-RateLimit-Limit", String(limit));
    response.headers.set("X-RateLimit-Remaining", "0");
    response.headers.set("X-RateLimit-Reset", String(reset));
    return { limited: true, response };
  }

  return { limited: false };
}

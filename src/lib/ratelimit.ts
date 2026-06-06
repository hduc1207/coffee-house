import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

const hasUpstashEnv =
    !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstashEnv ? Redis.fromEnv() : null;

const noLimiter = {
    limit: async () => ({
        success: true,
        limit: 0,
        remaining: 0,
        reset: 0,
        pending: Promise.resolve(),
    }),
};

export const orderRatelimit = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(5, "1 m"),
          analytics: true,
          prefix: "rl:order",
      })
    : (noLimiter as unknown as Ratelimit);

export const registerRatelimit = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(3, "1 h"),
          analytics: true,
          prefix: "rl:register",
      })
    : (noLimiter as unknown as Ratelimit);

export const loginRatelimit = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(5, "1 m"),
          analytics: true,
          prefix: "rl:login",
      })
    : (noLimiter as unknown as Ratelimit);

export function getClientIp(req: Request | NextRequest): string {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();
    return "anonymous";
}

export async function safeRatelimit(
    limiter: Ratelimit,
    identifier: string,
): Promise<{ success: boolean; reset: number }> {
    try {
        const result = await limiter.limit(identifier);
        return { success: result.success, reset: result.reset };
    } catch (err) {
        console.warn("[ratelimit] error:", err);
        return { success: true, reset: 0 };
    }
}

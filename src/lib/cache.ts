import { Redis } from "@upstash/redis";
import type { Product, Store } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const TTL_SECONDS = 60 * 60;
const KEY_VERSION = "v1";

const KEYS = {
    menuList: () => `menu:list:${KEY_VERSION}`,
    productBySlug: (slug: string) => `menu:slug:${slug}:${KEY_VERSION}`,
    storeList: () => `stores:list:${KEY_VERSION}`,
};

const hasUpstashEnv =
    !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstashEnv ? Redis.fromEnv() : null;

async function safeGet<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
        return (await redis.get<T>(key)) ?? null;
    } catch (err) {
        console.warn("[cache] Redis GET failed, fallback to DB", { err, key });
        return null;
    }
}

async function safeSet<T>(key: string, value: T, ttlSec = TTL_SECONDS): Promise<void> {
    if (!redis) return;
    try {
        await redis.set(key, JSON.stringify(value), { ex: ttlSec });
    } catch (err) {
        console.warn("[cache] Redis SET failed", { err, key });
    }
}

export async function getMenuProducts(): Promise<Product[]> {
    const cached = await safeGet<Product[]>(KEYS.menuList());
    if (cached) {
        console.debug("[cache] menu HIT", { count: cached.length });
        return cached;
    }

    try {
        const products = await prisma.product.findMany({
            where: { isAvailable: true },
            orderBy: { createdAt: "desc" },
        });

        console.debug("[cache] menu MISS, querying DB", { count: products?.length || 0 });
        
        if (products) {
            await safeSet(KEYS.menuList(), products);
            return products;
        }
        return [];
    } catch (error) {
        console.error("[cache] getMenuProducts DB error", error);
        return [];
    }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const cached = await safeGet<Product>(KEYS.productBySlug(slug));
    if (cached) {
        console.debug("[cache] product HIT", { slug });
        return cached;
    }

    const product = await prisma.product.findFirst({
        where: { slug, isAvailable: true },
    });

    if (product) {
        await safeSet(KEYS.productBySlug(slug), product);
    }

    return product;
}

export async function invalidateMenuCache(slugs?: string[]): Promise<void> {
    if (!redis) return;
    try {
        const keys = [KEYS.menuList(), ...(slugs ?? []).map(KEYS.productBySlug)];
        await redis.del(...keys);
        console.info("[cache] menu invalidated", { keys });
    } catch (err) {
        console.warn("[cache] invalidate failed", { err });
    }
}

export async function getStores(): Promise<Store[]> {
    const cached = await safeGet<Store[]>(KEYS.storeList());
    if (cached) {
        console.debug("[cache] stores HIT", { count: cached.length });
        return cached;
    }

    try {
        const stores = await prisma.store.findMany({
            orderBy: { createdAt: "asc" },
        });

        console.debug("[cache] stores MISS, querying DB", { count: stores?.length || 0 });

        if (stores) {
            await safeSet(KEYS.storeList(), stores);
            return stores;
        }
        return [];
    } catch (error) {
        console.error("[cache] getStores DB error", error);
        return [];
    }
}

export async function invalidateStoreCache(): Promise<void> {
    if (!redis) return;
    try {
        await redis.del(KEYS.storeList());
        console.info("[cache] store cache invalidated");
    } catch (err) {
        console.warn("[cache] invalidateStoreCache failed", { err });
    }
}

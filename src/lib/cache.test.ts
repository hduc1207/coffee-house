import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted chạy TRƯỚC mọi import - cần thiết vì cache.ts đọc env và khởi
// tạo Redis ngay ở module-level. Nếu set process.env sau khi import, đã muộn.
const { mockRedis } = vi.hoisted(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://mock.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";
    return {
        mockRedis: {
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
        },
    };
});

vi.mock("@upstash/redis", () => ({
    Redis: {
        fromEnv: () => mockRedis,
    },
}));

vi.mock("@/lib/prisma", () => ({
    prisma: {
        product: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
        },
        store: {
            findMany: vi.fn(),
        },
    },
}));

import { getMenuProducts, getProductBySlug, invalidateMenuCache, getStores, invalidateStoreCache } from "./cache";
import { prisma } from "@/lib/prisma";

describe("cache.getMenuProducts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns cached value khi Redis HIT (không query DB)", async () => {
        const cached = [{ id: "p1", name: "Cached", isAvailable: true }];
        mockRedis.get.mockResolvedValueOnce(cached);

        const result = await getMenuProducts();

        expect(result).toEqual(cached);
        expect(mockRedis.get).toHaveBeenCalledWith("menu:list:v1");
        expect(prisma.product.findMany).not.toHaveBeenCalled();
        expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it("query DB rồi set Redis khi cache MISS", async () => {
        const fresh = [{ id: "p1", name: "Fresh", isAvailable: true }];
        mockRedis.get.mockResolvedValueOnce(null);
        vi.mocked(prisma.product.findMany).mockResolvedValueOnce(fresh as never);

        const result = await getMenuProducts();

        expect(result).toEqual(fresh);
        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: { isAvailable: true },
            orderBy: { createdAt: "desc" },
        });
        expect(mockRedis.set).toHaveBeenCalledWith(
            "menu:list:v1",
            JSON.stringify(fresh),
            { ex: 3600 },
        );
    });

    it("fallback DB khi Redis GET throw (fail-open)", async () => {
        mockRedis.get.mockRejectedValueOnce(new Error("Network down"));
        vi.mocked(prisma.product.findMany).mockResolvedValueOnce([] as never);

        const result = await getMenuProducts();

        expect(result).toEqual([]);
        expect(prisma.product.findMany).toHaveBeenCalled();
    });
});

describe("cache.getProductBySlug", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("trả về product cached khi HIT", async () => {
        const cached = { id: "p1", slug: "ca-phe", name: "Cà phê" };
        mockRedis.get.mockResolvedValueOnce(cached);

        const result = await getProductBySlug("ca-phe");

        expect(result).toEqual(cached);
        expect(mockRedis.get).toHaveBeenCalledWith("menu:slug:ca-phe:v1");
        expect(prisma.product.findFirst).not.toHaveBeenCalled();
    });

    it("KHÔNG cache null khi product không tồn tại", async () => {
        mockRedis.get.mockResolvedValueOnce(null);
        vi.mocked(prisma.product.findFirst).mockResolvedValueOnce(null);

        const result = await getProductBySlug("ghost");

        expect(result).toBeNull();
        expect(prisma.product.findFirst).toHaveBeenCalledWith({
            where: { slug: "ghost", isAvailable: true },
        });
        expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it("set cache khi DB trả về product", async () => {
        const dbProduct = { id: "p2", slug: "tra-dao", name: "Trà đào" };
        mockRedis.get.mockResolvedValueOnce(null);
        vi.mocked(prisma.product.findFirst).mockResolvedValueOnce(dbProduct as never);

        const result = await getProductBySlug("tra-dao");

        expect(result).toEqual(dbProduct);
        expect(mockRedis.set).toHaveBeenCalledWith(
            "menu:slug:tra-dao:v1",
            JSON.stringify(dbProduct),
            { ex: 3600 },
        );
    });
});

describe("cache.invalidateMenuCache", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("xóa key list khi không truyền slugs", async () => {
        await invalidateMenuCache();
        expect(mockRedis.del).toHaveBeenCalledWith("menu:list:v1");
    });

    it("xóa list + tất cả slug keys khi truyền slugs", async () => {
        await invalidateMenuCache(["ca-phe", "tra-dao"]);
        expect(mockRedis.del).toHaveBeenCalledWith(
            "menu:list:v1",
            "menu:slug:ca-phe:v1",
            "menu:slug:tra-dao:v1",
        );
    });

    it("không throw khi Redis lỗi", async () => {
        mockRedis.del.mockRejectedValueOnce(new Error("Network down"));
        await expect(invalidateMenuCache()).resolves.toBeUndefined();
    });
});

describe("cache.getStores", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns cached stores khi Redis HIT", async () => {
        const cached = [{ id: "s1", name: "Store A", city: "Hanoi" }];
        mockRedis.get.mockResolvedValueOnce(cached);

        const result = await getStores();

        expect(result).toEqual(cached);
        expect(mockRedis.get).toHaveBeenCalledWith("stores:list:v1");
        expect(prisma.store.findMany).not.toHaveBeenCalled();
    });

    it("query DB rồi set Redis khi cache MISS", async () => {
        const fresh = [{ id: "s1", name: "Store A", city: "Hanoi" }];
        mockRedis.get.mockResolvedValueOnce(null);
        vi.mocked(prisma.store.findMany).mockResolvedValueOnce(fresh as never);

        const result = await getStores();

        expect(result).toEqual(fresh);
        expect(prisma.store.findMany).toHaveBeenCalledWith({
            orderBy: { createdAt: "asc" },
        });
        expect(mockRedis.set).toHaveBeenCalledWith(
            "stores:list:v1",
            JSON.stringify(fresh),
            { ex: 3600 },
        );
    });

    it("fallback DB khi Redis GET throw (fail-open)", async () => {
        mockRedis.get.mockRejectedValueOnce(new Error("Network down"));
        vi.mocked(prisma.store.findMany).mockResolvedValueOnce([] as never);

        const result = await getStores();

        expect(result).toEqual([]);
        expect(prisma.store.findMany).toHaveBeenCalled();
    });
});

describe("cache.invalidateStoreCache", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("xóa store cache key", async () => {
        await invalidateStoreCache();
        expect(mockRedis.del).toHaveBeenCalledWith("stores:list:v1");
    });

    it("không throw khi Redis lỗi", async () => {
        mockRedis.del.mockRejectedValueOnce(new Error("Network down"));
        await expect(invalidateStoreCache()).resolves.toBeUndefined();
    });
});

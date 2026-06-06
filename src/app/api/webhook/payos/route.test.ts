/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPayosVerify } = vi.hoisted(() => ({
    mockPayosVerify: vi.fn(),
}));

vi.mock("@/lib/payos", () => ({
    payos: {
        webhooks: {
            verify: mockPayosVerify,
        },
    },
}));

vi.mock("@/lib/prisma", () => ({
    prisma: {
        order: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        product: {
            update: vi.fn(),
        },
        $transaction: vi.fn(async (cb: (tx: any) => any) => {
            const tx = {
                order: {
                    update: vi.fn(),
                },
                product: {
                    update: vi.fn(),
                },
            };
            return cb(tx);
        }),
    },
}));

import { POST } from "./route";
import { prisma } from "@/lib/prisma";

const makeRequest = (body: unknown) =>
    new Request("http://localhost/api/webhook/payos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

describe("POST /api/webhook/payos", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when signature verification fails", async () => {
        mockPayosVerify.mockImplementationOnce(() => {
            throw new Error("Invalid signature");
        });

        const res = await POST(makeRequest({ signature: "invalid" }));
        expect(res.status).toBe(400);
    });

    it("returns 404 when order is not found", async () => {
        mockPayosVerify.mockReturnValueOnce({ orderCode: 999 });
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce(null);

        const res = await POST(makeRequest({ code: "00", data: { orderCode: 999 } }));
        expect(res.status).toBe(404);
    });

    it("returns 200 and skips if order is not PENDING", async () => {
        mockPayosVerify.mockReturnValueOnce({ orderCode: 100 });
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce({
            id: "o1",
            orderCode: 100,
            status: "PROCESSING",
        } as any);

        const res = await POST(makeRequest({ code: "00", data: { orderCode: 100 } }));
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.message).toContain("đã được xử lý");
        expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it("updates order to PROCESSING when code is 00", async () => {
        mockPayosVerify.mockReturnValueOnce({ orderCode: 100 });
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce({
            id: "o1",
            orderCode: 100,
            status: "PENDING",
        } as any);

        const res = await POST(makeRequest({ code: "00", data: { orderCode: 100 } }));
        expect(res.status).toBe(200);
        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { id: "o1" },
            data: { status: "PROCESSING" },
        });
    });

    it("updates order to CANCELLED and refunds stock when payment fails", async () => {
        mockPayosVerify.mockReturnValueOnce({ orderCode: 100 });
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce({
            id: "o1",
            orderCode: 100,
            status: "PENDING",
            items: [
                { productId: "p1", quantity: 2 },
            ],
        } as any);

        const res = await POST(makeRequest({ code: "01", data: { orderCode: 100 } }));
        expect(res.status).toBe(200);
        expect(prisma.$transaction).toHaveBeenCalled();
    });
});

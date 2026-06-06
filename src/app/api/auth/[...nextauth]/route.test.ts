import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("bcryptjs", () => {
    const mod = { compare: vi.fn(), hash: vi.fn() };
    return { ...mod, default: mod };
});

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper: lấy provider Credentials và hàm authorize ra test trực tiếp.
// authOptions.providers[1] là CredentialsProvider (index 0 là Google).
type AuthorizeFn = (
    credentials: Record<string, string> | undefined,
) => Promise<unknown>;

function getAuthorize(): AuthorizeFn {
    const credProvider = authOptions.providers.find(
        (p) => (p as { id?: string }).id === "credentials",
    ) as { options?: { authorize?: AuthorizeFn } } | undefined;
    // next-auth v4 lưu user options ở provider.options.authorize,
    // còn provider.authorize là default `() => null`.
    const authorize = credProvider?.options?.authorize;
    if (!authorize) throw new Error("Credentials authorize không tìm thấy");
    return authorize;
}

describe("authOptions.callbacks.jwt", () => {
    it("ghi đè token bằng các field từ user khi user mới đăng nhập", async () => {
        const cb = authOptions.callbacks!.jwt!;
        const result = await cb({
            token: {} as never,
            user: {
                id: "u1",
                name: "A",
                email: "a@b.com",
                image: null,
                role: "admin",
            } as never,
        } as never);

        expect(result).toMatchObject({
            id: "u1",
            email: "a@b.com",
            role: "admin",
        });
    });

    it("không sửa token khi không có user (request thường)", async () => {
        const cb = authOptions.callbacks!.jwt!;
        const existing = { id: "u1", role: "user" } as never;
        const result = await cb({ token: existing } as never);
        expect(result).toBe(existing);
    });
});

describe("authOptions.callbacks.session", () => {
    it("đẩy id, role từ token vào session.user", async () => {
        const cb = authOptions.callbacks!.session!;
        const result = (await cb({
            session: { user: {} } as never,
            token: { id: "u1", name: "A", email: "a@b.com", role: "admin" } as never,
        } as never)) as { user: { id: string; role: string } };

        expect(result.user.id).toBe("u1");
        expect(result.user.role).toBe("admin");
    });

    it("default role = 'user' khi token không có role", async () => {
        const cb = authOptions.callbacks!.session!;
        const result = (await cb({
            session: { user: {} } as never,
            token: { id: "u1" } as never,
        } as never)) as { user: { role: string } };

        expect(result.user.role).toBe("user");
    });
});

describe("CredentialsProvider.authorize", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throw khi thiếu email hoặc password", async () => {
        const authorize = getAuthorize();
        await expect(authorize({} as never)).rejects.toThrow(/email/i);
    });

    it("throw khi user không tồn tại", async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
        const authorize = getAuthorize();

        await expect(
            authorize({ email: "nope@x.com", password: "Aa1!aaaa" }),
        ).rejects.toThrow(/không tồn tại/i);
    });

    it("throw khi user đăng nhập bằng Google (password=null)", async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            id: "u1",
            email: "g@x.com",
            password: null,
        } as never);
        const authorize = getAuthorize();

        await expect(
            authorize({ email: "g@x.com", password: "anything" }),
        ).rejects.toThrow(/Google/i);
    });

    it("throw khi password sai", async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            id: "u1",
            email: "a@b.com",
            password: "hash",
        } as never);
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);
        const authorize = getAuthorize();

        await expect(
            authorize({ email: "a@b.com", password: "wrong" }),
        ).rejects.toThrow(/không chính xác/i);
    });

    it("trả về user khi password đúng", async () => {
        const fakeUser = {
            id: "u1",
            email: "a@b.com",
            password: "hash",
            name: "A",
            role: "user",
        };
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(fakeUser as never);
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
        const authorize = getAuthorize();

        const result = await authorize({ email: "a@b.com", password: "ok" });
        expect(result).toEqual(fakeUser);
    });
});

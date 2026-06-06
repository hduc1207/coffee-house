import { z } from "zod";

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug", "trace"])
        .optional(),

    DATABASE_URL: z.string().url("DATABASE_URL phải là Postgres connection URL"),
    DIRECT_URL: z.string().url().optional(),

    NEXTAUTH_URL: z.string().url("NEXTAUTH_URL phải là URL hợp lệ"),
    NEXTAUTH_SECRET: z
        .string()
        .min(32, "NEXTAUTH_SECRET phải dài tối thiểu 32 ký tự"),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal("")),

    PAYOS_CLIENT_ID: z.string().optional().or(z.literal("")),
    PAYOS_API_KEY: z.string().optional().or(z.literal("")),
    PAYOS_CHECKSUM_KEY: z.string().optional().or(z.literal("")),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Biến môi trường không hợp lệ:");
    for (const issue of parsed.error.issues) {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export type Env = z.infer<typeof EnvSchema>;

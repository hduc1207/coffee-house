import { SessionStrategy } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginRatelimit, safeRatelimit } from "@/lib/ratelimit";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                  GoogleProvider({
                      clientId: process.env.GOOGLE_CLIENT_ID as string,
                      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                      allowDangerousEmailAccountLinking: true,
                  }),
              ]
            : []),

        CredentialsProvider({
            name: "Tài khoản",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mật khẩu", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Vui lòng nhập email và mật khẩu.");
                }

                const identifier = credentials.email as string;
                const { success } = await safeRatelimit(loginRatelimit, identifier);
                if (!success) {
                    throw new Error("Bạn đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.password) {
                    throw new Error("Tài khoản không tồn tại hoặc bạn từng đăng nhập bằng Google.");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

                if (!isPasswordValid) {
                    throw new Error("Mật khẩu không chính xác.");
                }

                return user;
            }
        })
    ],
    session: {
        strategy: "jwt" as SessionStrategy,
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user, trigger }: { token: JWT; user?: User; trigger?: string }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.image = user.image;
                token.role = user.role;
            }
            if (trigger === "update") {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { role: true },
                });
                if (dbUser) {
                    token.role = dbUser.role;
                }
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = (token.name as string) || null;
                session.user.email = (token.email as string) || null;
                session.user.image = (token.image as string) || null;
                session.user.role = (token.role as string) || "user";
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    }
};

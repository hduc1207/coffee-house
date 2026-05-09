import NextAuth, { SessionStrategy } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),

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
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: any }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = (token.name as string) || null;
                session.user.email = (token.email as string) || null;
                session.user.image = (token.image as string) || null;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    }
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
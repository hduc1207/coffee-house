import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/authOptions";
import ProfileManager from "@/components/ProfileManager";
import AccountSidebar from "@/components/AccountSidebar";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        redirect("/");
    }
    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    return (
        <div className="min-h-screen bg-[#faf8f5] text-[#333] font-sans pt-24">
            <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
                <AccountSidebar userName={dbUser?.name || ""} />

                <main className="flex-1">
                    <h1 className="text-3xl font-serif mb-8 text-aesop-accent">Cài đặt tài khoản</h1>
                    <ProfileManager
                        currentName={dbUser?.name || ""}
                        currentEmail={dbUser?.email || ""}
                    />
                </main>

            </div>
        </div>
    );
}
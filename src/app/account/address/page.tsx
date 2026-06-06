import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import AccountSidebar from "@/components/AccountSidebar";
import AddressManager from "@/components/AddressManager";
import AddressCard from "@/components/AddressCard";
import { prisma } from "@/lib/prisma";

export default async function AddressPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        redirect("/");
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { addresses: true }
    });
    const addresses = dbUser?.addresses || [];

    return (
        <div className="min-h-screen bg-[#faf8f5] text-[#333] font-sans pt-24">
            <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
                <AccountSidebar userName={dbUser?.name || session?.user?.name || ""} />

                <main className="flex-1">
                    <h1 className="text-3xl font-serif mb-8 text-aesop-accent">Sổ địa chỉ</h1>
                    {addresses.length === 0 ? (
                        <p className="text-gray-600 mb-8">Chưa có địa chỉ nào được lưu.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {addresses.map((addr) => (
                                <AddressCard
                                    key={addr.id}
                                    id={addr.id}
                                    name={addr.name}
                                    phone={addr.phone}
                                    street={addr.street}
                                />
                            ))}
                        </div>
                    )}

                    <AddressManager />
                </main>

            </div>
        </div>
    );
}
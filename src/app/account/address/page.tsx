import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";
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
                <aside className="w-full md:w-64 flex-shrink-0">
                    <h2 className="text-xl mb-8 font-medium">Xin chào, <br/> <span className="block mt-1">{ dbUser?.name || session?.user?.name || "Khách hàng" }</span></h2>

                    <nav className="space-y-4">
                        <div className="pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium mb-4">Tài khoản của bạn</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/account" className="hover:text-gray-500 flex justify-between">Cài đặt tài khoản <span>›</span></Link></li>
                                <li><Link href="/account/orders" className="hover:text-gray-500 flex justify-between">Lịch sử đơn hàng <span>›</span></Link></li>
                                <li><Link href="/account/address" className="font-bold flex justify-between">Sổ địa chỉ <span>›</span></Link></li>
                            </ul>
                        </div>
                        <div className="pt-4">
                            <LogoutButton />
                        </div>
                    </nav>
                </aside>

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
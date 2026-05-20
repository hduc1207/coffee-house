import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        redirect("/");
    }

    const orders = await prisma.order.findMany({
        where: { userId: session.user.id as string },
        include: { items: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-[#faf8f5] text-[#333] font-sans pt-24">
            <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
                <aside className="w-full md:w-64 flex-shrink-0">
                    <h2 className="text-xl mb-8 font-medium">Xin chào, <br/><span className="block mt-1">{ session?.user?.name || "Khách hàng" }</span></h2>

                    <nav className="space-y-4">
                        <div className="pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium mb-4">Tài khoản của bạn</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/account" className="hover:text-gray-500 flex justify-between">Cài đặt tài khoản <span>›</span></Link></li>
                                <li><Link href="/account/orders" className="font-bold flex justify-between">Lịch sử đơn hàng <span>›</span></Link></li>
                                <li><Link href="/account/address" className="hover:text-gray-500 flex justify-between">Sổ địa chỉ <span>›</span></Link></li>
                            </ul>
                        </div>
                        <div className="pt-4">
                            <LogoutButton />
                        </div>
                    </nav>
                </aside>

                <main className="flex-1">
                    <h1 className="text-3xl font-serif mb-8">Lịch sử đơn hàng</h1>

                    {orders.length === 0 ? (
                        <p className="text-gray-600">Bạn chưa có đơn hàng nào.</p>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-medium">Đơn hàng #{order.id.slice(-8)}</h3>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{order.totalAmount.toLocaleString('vi-VN')}đ</p>

                                            <p className={`text-sm mt-1 font-medium ${
                                                order.status === 'PENDING' ? 'text-yellow-600' :
                                                    order.status === 'CONFIRMED' ? 'text-blue-600' :
                                                        order.status === 'DELIVERED' ? 'text-green-600' :
                                                            'text-red-600'
                                            }`}>
                                                {order.status === 'PENDING' ? 'CHỜ XÁC NHẬN' :
                                                    order.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' :
                                                        order.status === 'DELIVERED' ? 'ĐÃ GIAO' :
                                                            order.status === 'CANCELLED' ? 'ĐÃ HỦY' : order.status}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.name} x{item.quantity}</span>
                                                <span>{item.price.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t text-sm text-gray-600 space-y-1">
                                        <p><strong className="font-medium text-[#333]">Giao hàng:</strong> {order.deliveryMethod === 'pickup' ? 'Lấy tại quán' : 'Giao tận nơi'}</p>
                                        <p><strong className="font-medium text-[#333]">Thanh toán:</strong> {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}</p>
                                        {order.address && <p><strong className="font-medium text-[#333]">Địa chỉ:</strong> {order.address}</p>}
                                        {order.notes && <p><strong className="font-medium text-[#333]">Ghi chú:</strong> {order.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}
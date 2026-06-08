import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import AccountSidebar from "@/components/AccountSidebar";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        redirect("/");
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    if (!dbUser) { redirect("/"); }

    const orders = await prisma.order.findMany({
        where: { userId: dbUser.id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-[#faf8f5] text-[#333] font-sans pt-24">
            <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
                <AccountSidebar userName={dbUser?.name || session?.user?.name || ""} />

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
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{order.totalAmount.toLocaleString('vi-VN')}đ</p>

                                            <p className={`text-sm mt-1 font-medium ${
                                                order.status === 'PENDING' ? 'text-yellow-600' :
                                                    order.status === 'PROCESSING' ? 'text-blue-600' :
                                                        order.status === 'COMPLETED' ? 'text-green-600' :
                                                            'text-red-600'
                                            }`}>
                                                {order.status === 'PENDING' ? 'CHỜ XÁC NHẬN' :
                                                    order.status === 'PROCESSING' ? 'ĐÃ THANH TOÁN' :
                                                        order.status === 'COMPLETED' ? 'ĐÃ HOÀN THÀNH' :
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

                                    {order.status === 'PENDING' && order.paymentMethod === 'payos' && (
                                        <div className="mt-4 pt-4 border-t">
                                            <a
                                                href={`/checkout/payment?orderId=${order.id}`}
                                                className="inline-block px-5 py-2.5 text-xs uppercase tracking-widest bg-[#333] text-[#faf8f5] hover:bg-[#555] transition-colors"
                                            >
                                                Tiếp tục thanh toán
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}
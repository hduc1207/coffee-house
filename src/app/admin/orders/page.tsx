import { prisma } from "@/lib/prisma";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: true },
    });
    type OrderWithItems = typeof orders[number];

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-serif text-[#333] mb-8 border-b pb-4">
                    Quản Lý Đơn Hàng ({orders.length} đơn)
                </h1>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#333] text-white">
                        <tr>
                            <th className="p-4 font-medium tracking-widest uppercase text-xs">Mã Đơn</th>
                            <th className="p-4 font-medium tracking-widest uppercase text-xs">Khách Hàng</th>
                            <th className="p-4 font-medium tracking-widest uppercase text-xs">Thông Tin Nhận</th>
                            <th className="p-4 font-medium tracking-widest uppercase text-xs">Món Đặt</th>
                            <th className="p-4 font-medium tracking-widest uppercase text-xs">Tổng Tiền</th>
                            <th className="p-4 font-medium tracking-widest uppercase text-xs">Trạng Thái</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">Chưa có đơn hàng nào.</td>
                            </tr>
                        ) : (
                            orders.map((order: OrderWithItems) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-xs text-gray-400 font-mono">#{String(order.id).slice(0, 8)}</td>

                                    <td className="p-4">
                                        <p className="font-medium text-gray-800">{order.customerName}</p>
                                        <p className="text-gray-500 mt-1">{order.phone}</p>
                                    </td>

                                    <td className="p-4">
                                        <p className="font-medium text-blue-600">
                                            {order.deliveryMethod === "pickup" ? "Lấy tại quán" : "Giao hàng"}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1 w-48 truncate" title={order.address || ""}>
                                            {order.address}
                                        </p>
                                        {order.notes && (
                                            <p className="text-red-500 text-xs mt-1">Lưu ý: {order.notes}</p>
                                        )}
                                    </td>

                                    <td className="p-4">
                                        <ul className="list-disc pl-4 text-gray-600 space-y-1">
                                            {order.items.map((item: { id: string | number; name: string; quantity: number }) => (
                                                <li key={item.id} className="text-xs">
                                                    <span className="font-medium">{item.quantity}x</span> {item.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>

                                    <td className="p-4 font-medium text-gray-800">
                                        {order.totalAmount.toLocaleString('vi-VN')}đ
                                        <p className="text-xs text-gray-400 mt-1 uppercase">
                                            {order.paymentMethod}
                                        </p>
                                    </td>

                                    <td className="p-4">
                                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

const STATUS_FILTER = [
    { value: "all", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "PROCESSING", label: "Đang xử lý" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_STYLE: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; q?: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") redirect("/");

    const { status: statusFilter = "all", q = "" } = await searchParams;

    const where: Record<string, unknown> = {};
    if (statusFilter !== "all") where.status = statusFilter;
    if (q) {
        where.OR = [
            { customerName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
        ];
    }

    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { items: true, voucher: { select: { code: true } } },
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Quản lý Đơn hàng</h1>
                <p className="text-sm text-gray-500 mt-1">{orders.length} đơn hàng</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Search */}
                <form method="GET" className="flex-1">
                    <input
                        name="q"
                        defaultValue={q}
                        type="text"
                        placeholder="Tìm theo tên khách hoặc số điện thoại..."
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#6F4E37] text-gray-700"
                    />
                </form>
                {/* Status tabs */}
                <div className="flex gap-2 flex-wrap">
                    {STATUS_FILTER.map((s) => (
                        <a
                            key={s.value}
                            href={`/admin/orders?status=${s.value}${q ? `&q=${q}` : ""}`}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                                statusFilter === s.value
                                    ? "bg-[#6F4E37] text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {s.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {orders.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Không có đơn hàng nào</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left">Mã đơn</th>
                                    <th className="px-4 py-3 text-left">Khách hàng</th>
                                    <th className="px-4 py-3 text-left">Thông tin nhận</th>
                                    <th className="px-4 py-3 text-left">Món đặt</th>
                                    <th className="px-4 py-3 text-right">Tổng tiền</th>
                                    <th className="px-4 py-3 text-left">Thanh toán</th>
                                    <th className="px-4 py-3 text-left">Ngày đặt</th>
                                    <th className="px-4 py-3 text-left">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-mono text-xs text-gray-400">#{order.orderCode}</p>
                                        </td>

                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">{order.customerName}</p>
                                            <p className="text-xs text-gray-400">{order.phone}</p>
                                        </td>

                                        <td className="px-4 py-3 max-w-[180px]">
                                            <p className={`text-xs font-medium ${order.deliveryMethod === "pickup" ? "text-purple-600" : "text-blue-600"}`}>
                                                {order.deliveryMethod === "pickup" ? "🏪 Lấy tại quán" : "🚚 Giao hàng"}
                                            </p>
                                            {order.address && (
                                                <p className="text-xs text-gray-400 truncate mt-0.5" title={order.address}>{order.address}</p>
                                            )}
                                            {order.notes && (
                                                <p className="text-xs text-orange-500 mt-0.5">📌 {order.notes}</p>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <ul className="space-y-0.5">
                                                {order.items.map((item) => (
                                                    <li key={item.id} className="text-xs text-gray-600">
                                                        <span className="font-medium">{item.quantity}×</span> {item.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <p className="font-medium text-gray-800">{order.totalAmount.toLocaleString("vi-VN")}đ</p>
                                            {order.discountAmount > 0 && (
                                                <p className="text-xs text-green-600">-{order.discountAmount.toLocaleString("vi-VN")}đ</p>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase w-fit ${
                                                    order.paymentMethod === "payos"
                                                        ? "bg-indigo-100 text-indigo-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}>
                                                    {order.paymentMethod === "payos" ? "QR / PayOS" : order.paymentMethod === "cod" ? "Tiền mặt" : order.paymentMethod}
                                                </span>
                                                {order.voucher?.code && (
                                                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded w-fit">
                                                        🎟 {order.voucher.code}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                                        </td>

                                        <td className="px-4 py-3">
                                            <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import AdminOrdersRefresh from "@/components/admin/AdminOrdersRefresh";

export const dynamic = "force-dynamic";

const STATUS_FILTER = [
    { value: "all", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "PROCESSING", label: "Đã thanh toán" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_STYLE: Record<string, string> = {
    PENDING: "bg-[#FFF9E6] text-[#805B00] border border-[#FFE7A3]",
    PROCESSING: "bg-[#EBF3FF] text-[#00409E] border border-[#C2DBFF]",
    COMPLETED: "bg-[#EBFDF5] text-[#006039] border border-[#B6F5D9]",
    CANCELLED: "bg-[#F5F5F5] text-[#666666] border border-[#E0E0E0]",
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
        <div className="p-8 max-w-7xl mx-auto text-[#333]">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif mb-2">Quản lý Đơn hàng</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{orders.length} đơn hàng</p>
                </div>
                <AdminOrdersRefresh />
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
                        className="w-full px-4 py-2 text-xs border border-gray-200 rounded-none focus:outline-none focus:border-black text-gray-700 bg-white"
                    />
                </form>
                {/* Status tabs */}
                <div className="flex gap-2 flex-wrap">
                    {STATUS_FILTER.map((s) => (
                        <a
                            key={s.value}
                            href={`/admin/orders?status=${s.value}${q ? `&q=${q}` : ""}`}
                            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-none transition-colors border whitespace-nowrap ${
                                statusFilter === s.value
                                    ? "bg-black border-black text-white"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-[#faf8f5] hover:border-gray-300"
                            }`}
                        >
                            {s.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-none shadow-none overflow-hidden">
                {orders.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Không có đơn hàng nào</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#faf8f5]/40 border-b border-gray-200">
                                <tr className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                    <th className="px-4 py-3.5 text-left font-semibold">Mã đơn</th>
                                    <th className="px-4 py-3.5 text-left font-semibold">Khách hàng</th>
                                    <th className="px-4 py-3.5 text-left font-semibold">Thông tin nhận</th>
                                    <th className="px-4 py-3.5 text-left font-semibold">Món đặt</th>
                                    <th className="px-4 py-3.5 text-right font-semibold">Tổng tiền</th>
                                    <th className="px-4 py-3.5 text-left font-semibold">Thanh toán</th>
                                    <th className="px-4 py-3.5 text-left font-semibold">Ngày đặt</th>
                                    <th className="px-4 py-3.5 text-left font-semibold">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#faf8f5]/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-mono text-xs text-gray-400">#{order.orderCode}</p>
                                        </td>

                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-gray-800">{order.customerName}</p>
                                            <p className="text-xs font-mono text-gray-400">{order.phone}</p>
                                        </td>

                                        <td className="px-4 py-3 max-w-[180px]">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-widest border ${
                                                order.deliveryMethod === "pickup"
                                                    ? "bg-[#FAF5FF] text-[#551A99] border-[#E8D6FF]"
                                                    : "bg-[#EBF3FF] text-[#00409E] border-[#C2DBFF]"
                                            }`}>
                                                {order.deliveryMethod === "pickup" ? (
                                                    <>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        Lấy tại quán
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zm-2 1v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v3m10-7h2m-2 0l-3-4H9.5M19 10H5m14-3h.01M5 7h.01" />
                                                        </svg>
                                                        Giao hàng
                                                    </>
                                                )}
                                            </span>
                                            {order.address && (
                                                <p className="text-xs text-gray-450 truncate mt-1" title={order.address}>{order.address}</p>
                                            )}
                                            {order.notes && (
                                                <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1 italic">
                                                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                    </svg>
                                                    {order.notes}
                                                </p>
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
                                            <p className="font-semibold text-gray-800">{order.totalAmount.toLocaleString("vi-VN")}đ</p>
                                            {order.discountAmount > 0 && (
                                                <p className="text-xs text-green-600 font-medium">-{order.discountAmount.toLocaleString("vi-VN")}đ</p>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`inline-block px-2 py-0.5 rounded-none text-[10px] font-bold tracking-widest uppercase w-fit border ${
                                                    order.paymentMethod === "payos"
                                                        ? "bg-[#EBFDF5] text-[#006039] border-[#B6F5D9]"
                                                        : "bg-[#F5F5F5] text-[#666666] border-[#E0E0E0]"
                                                }`}>
                                                    {order.paymentMethod === "payos" ? "QR / PayOS" : order.paymentMethod === "cod" ? "Tiền mặt" : order.paymentMethod}
                                                </span>
                                                {order.voucher?.code && (
                                                    <span className="text-[10px] font-mono text-[#805B00] bg-[#FFF9E6] border border-[#FFE7A3] px-1.5 py-0.5 rounded-none w-fit flex items-center gap-1 font-semibold">
                                                        <svg className="w-3 h-3 text-[#805B00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                                        </svg>
                                                        {order.voucher.code}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-xs font-mono text-gray-400 whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" })}
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
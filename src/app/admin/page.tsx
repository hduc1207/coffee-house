import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
        totalOrdersToday,
        totalOrdersMonth,
        revenueToday,
        revenueMonth,
        ordersByStatus,
        lowStockProducts,
        recentOrders,
        totalProducts,
    ] = await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.order.aggregate({
            where: { createdAt: { gte: startOfToday }, status: "COMPLETED" },
            _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
            where: { createdAt: { gte: startOfMonth }, status: "COMPLETED" },
            _sum: { totalAmount: true },
        }),
        prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
        prisma.product.findMany({
            where: { stock: { lte: 10 } },
            orderBy: { stock: "asc" },
            take: 5,
            select: { id: true, name: true, stock: true, isAvailable: true },
        }),
        prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { items: { select: { name: true, quantity: true } } },
        }),
        prisma.product.count({ where: { isAvailable: true } }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of ordersByStatus) {
        statusMap[s.status] = s._count.id;
    }

    return {
        totalOrdersToday,
        totalOrdersMonth,
        revenueToday: revenueToday._sum.totalAmount ?? 0,
        revenueMonth: revenueMonth._sum.totalAmount ?? 0,
        statusMap,
        lowStockProducts,
        recentOrders,
        totalProducts,
    };
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
    PROCESSING: { label: "Đã thanh toán", color: "bg-blue-100 text-blue-800" },
    COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động kinh doanh</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Đơn hôm nay"
                    value={stats.totalOrdersToday.toString()}
                    sub="đơn hàng mới"
                    color="bg-amber-50 border-amber-100"
                    icon="📦"
                />
                <StatCard
                    label="Đơn tháng này"
                    value={stats.totalOrdersMonth.toString()}
                    sub="đơn hàng"
                    color="bg-blue-50 border-blue-100"
                    icon="📊"
                />
                <StatCard
                    label="Doanh thu hôm nay"
                    value={stats.revenueToday.toLocaleString("vi-VN") + "đ"}
                    sub="đơn hoàn thành"
                    color="bg-green-50 border-green-100"
                    icon="💰"
                />
                <StatCard
                    label="Doanh thu tháng"
                    value={stats.revenueMonth.toLocaleString("vi-VN") + "đ"}
                    sub="đơn hoàn thành"
                    color="bg-purple-50 border-purple-100"
                    icon="📈"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Orders by status */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 col-span-1">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Đơn theo trạng thái</h2>
                    <div className="space-y-3">
                        {Object.entries(STATUS_LABEL).map(([key, { label, color }]) => (
                            <div key={key} className="flex justify-between items-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>
                                <span className="font-bold text-gray-800">{stats.statusMap[key] ?? 0}</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/admin/orders" className="mt-4 block text-center text-xs text-[#6F4E37] font-semibold hover:underline">
                        Xem tất cả đơn →
                    </Link>
                </div>

                {/* Low stock products */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 col-span-1">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">⚠️ Sắp hết hàng</h2>
                    {stats.lowStockProducts.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">Không có sản phẩm nào sắp hết</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.lowStockProducts.map((p) => (
                                <div key={p.id} className="flex justify-between items-center">
                                    <p className="text-sm text-gray-700 truncate max-w-[150px]">{p.name}</p>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-800"}`}>
                                        {p.stock === 0 ? "Hết hàng" : `Còn ${p.stock}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link href="/admin/products" className="mt-4 block text-center text-xs text-[#6F4E37] font-semibold hover:underline">
                        Quản lý sản phẩm →
                    </Link>
                </div>

                {/* Quick links */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 col-span-1">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Thao tác nhanh</h2>
                    <div className="space-y-2">
                        <QuickLink href="/admin/products" label="➕ Thêm sản phẩm mới" />
                        <QuickLink href="/admin/vouchers" label="🎟️ Tạo mã giảm giá" />
                        <QuickLink href="/admin/stores" label="🏠 Thêm cửa hàng" />
                        <QuickLink href="/admin/orders" label="📋 Xem đơn chờ xử lý" />
                    </div>
                </div>
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Đơn hàng gần nhất</h2>
                    <Link href="/admin/orders" className="text-xs text-[#6F4E37] font-semibold hover:underline">Xem tất cả</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3 text-left">Mã đơn</th>
                                <th className="px-6 py-3 text-left">Khách hàng</th>
                                <th className="px-6 py-3 text-left">Món đặt</th>
                                <th className="px-6 py-3 text-left">Tổng tiền</th>
                                <th className="px-6 py-3 text-left">Trạng thái</th>
                                <th className="px-6 py-3 text-left">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentOrders.map((order) => {
                                const s = STATUS_LABEL[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-mono text-xs text-gray-400">#{order.orderCode}</td>
                                        <td className="px-6 py-3">
                                            <p className="font-medium text-gray-800">{order.customerName}</p>
                                            <p className="text-xs text-gray-400">{order.phone}</p>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-gray-600">
                                            {order.items.slice(0, 2).map(i => `${i.quantity}x ${i.name}`).join(", ")}
                                            {order.items.length > 2 && ` +${order.items.length - 2} món`}
                                        </td>
                                        <td className="px-6 py-3 font-medium text-gray-800">{order.totalAmount.toLocaleString("vi-VN")}đ</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>{s.label}</span>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: string }) {
    return (
        <div className={`rounded-xl border p-5 ${color}`}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                <span className="text-xl">{icon}</span>
            </div>
            <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
    );
}

function QuickLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
        >
            {label}
        </Link>
    );
}

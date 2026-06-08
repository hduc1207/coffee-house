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
    PENDING: { label: "CHỜ XÁC NHẬN", color: "bg-[#FFF9E6] text-[#805B00] border border-[#FFE7A3]" },
    PROCESSING: { label: "ĐÃ THANH TOÁN", color: "bg-[#EBF3FF] text-[#00409E] border border-[#C2DBFF]" },
    COMPLETED: { label: "ĐÃ HOÀN THÀNH", color: "bg-[#EBFDF5] text-[#006039] border border-[#B6F5D9]" },
    CANCELLED: { label: "ĐÃ HỦY", color: "bg-[#F5F5F5] text-[#666666] border border-[#E0E0E0]" },
};

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div className="p-8 max-w-7xl mx-auto text-[#333]">
            <div className="mb-10">
                <h1 className="text-3xl font-serif mb-2">Dashboard</h1>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Tổng quan hoạt động kinh doanh</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Đơn hôm nay"
                    value={stats.totalOrdersToday.toString()}
                    sub="đơn hàng mới"
                    color="bg-[#FFF9E6] border-[#FFE7A3] text-[#805B00]"
                    icon={
                        <svg className="w-5 h-5 text-[#805B00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    }
                />
                <StatCard
                    label="Đơn tháng này"
                    value={stats.totalOrdersMonth.toString()}
                    sub="đơn hàng"
                    color="bg-[#EBF3FF] border-[#C2DBFF] text-[#00409E]"
                    icon={
                        <svg className="w-5 h-5 text-[#00409E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                />
                <StatCard
                    label="Doanh thu hôm nay"
                    value={stats.revenueToday.toLocaleString("vi-VN") + "đ"}
                    sub="đơn hoàn thành"
                    color="bg-[#EBFDF5] border-[#B6F5D9] text-[#006039]"
                    icon={
                        <svg className="w-5 h-5 text-[#006039]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    label="Doanh thu tháng"
                    value={stats.revenueMonth.toLocaleString("vi-VN") + "đ"}
                    sub="đơn hoàn thành"
                    color="bg-[#FAF5FF] border-[#E8D6FF] text-[#551A99]"
                    icon={
                        <svg className="w-5 h-5 text-[#551A99]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Orders by status */}
                <div className="bg-white border border-gray-200 p-6 rounded-none shadow-none col-span-1">
                    <h2 className="text-xs font-bold text-gray-700 mb-5 uppercase tracking-widest">Đơn theo trạng thái</h2>
                    <div className="space-y-4">
                        {Object.entries(STATUS_LABEL).map(([key, { label, color }]) => (
                            <div key={key} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-none uppercase ${color}`}>{label}</span>
                                <span className="font-semibold text-sm text-gray-800">{stats.statusMap[key] ?? 0}</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/admin/orders" className="mt-6 block text-center text-[10px] text-[#6F4E37] hover:text-[#553b2a] font-semibold uppercase tracking-widest transition-colors">
                        Xem tất cả đơn →
                    </Link>
                </div>

                {/* Low stock products */}
                <div className="bg-white border border-gray-200 p-6 rounded-none shadow-none col-span-1">
                    <h2 className="text-xs font-bold text-gray-700 mb-5 uppercase tracking-widest">Sắp hết hàng</h2>
                    {stats.lowStockProducts.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-8">Không có sản phẩm nào sắp hết</p>
                    ) : (
                        <div className="space-y-4">
                            {stats.lowStockProducts.map((p) => (
                                <div key={p.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <p className="text-sm text-gray-700 truncate max-w-[150px]">{p.name}</p>
                                    <span className={`text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-none uppercase ${p.stock === 0 ? "bg-[#FFF0F0] text-[#B80000] border border-[#FFD1D1]" : "bg-[#FFF9E6] text-[#805B00] border border-[#FFE7A3]"}`}>
                                        {p.stock === 0 ? "Hết hàng" : `Còn ${p.stock}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link href="/admin/products" className="mt-6 block text-center text-[10px] text-[#6F4E37] hover:text-[#553b2a] font-semibold uppercase tracking-widest transition-colors">
                        Quản lý sản phẩm →
                    </Link>
                </div>

                {/* Quick links */}
                <div className="bg-white border border-gray-200 p-6 rounded-none shadow-none col-span-1">
                    <h2 className="text-xs font-bold text-gray-700 mb-5 uppercase tracking-widest">Chức năng</h2>
                    <div className="space-y-3">
                        <QuickLink
                            href="/admin/products"
                            label="Thêm sản phẩm mới"
                            icon={
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            }
                        />
                        <QuickLink
                            href="/admin/vouchers"
                            label="Tạo mã giảm giá"
                            icon={
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            }
                        />
                        <QuickLink
                            href="/admin/stores"
                            label="Thêm cửa hàng"
                            icon={
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            }
                        />
                        <QuickLink
                            href="/admin/orders"
                            label="Xem đơn chờ xử lý"
                            icon={
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Recent orders */}
            <div className="bg-white border border-gray-200 rounded-none shadow-none overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#faf8f5]/40">
                    <h2 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Đơn hàng gần nhất</h2>
                    <Link href="/admin/orders" className="text-[10px] text-[#6F4E37] hover:text-[#553b2a] font-semibold uppercase tracking-widest transition-colors">Xem tất cả</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#faf8f5]/40 text-[10px] text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3.5 text-left font-semibold">Mã đơn</th>
                                <th className="px-6 py-3.5 text-left font-semibold">Khách hàng</th>
                                <th className="px-6 py-3.5 text-left font-semibold">Món đặt</th>
                                <th className="px-6 py-3.5 text-left font-semibold">Tổng tiền</th>
                                <th className="px-6 py-3.5 text-left font-semibold">Trạng thái</th>
                                <th className="px-6 py-3.5 text-left font-semibold">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentOrders.map((order) => {
                                const s = STATUS_LABEL[order.status] ?? { label: order.status, color: "text-gray-500" };
                                return (
                                    <tr key={order.id} className="hover:bg-[#faf8f5]/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order.orderCode}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-800">{order.customerName}</p>
                                            <p className="text-xs font-mono text-gray-400 mt-0.5">{order.phone}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-600">
                                            {order.items.slice(0, 2).map(i => `${i.quantity}x ${i.name}`).join(", ")}
                                            {order.items.length > 2 && ` +${order.items.length - 2} món`}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{order.totalAmount.toLocaleString("vi-VN")}đ</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-none uppercase ${s.color}`}>{s.label}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-400">
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

function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode }) {
    return (
        <div className={`border p-5 rounded-none shadow-none transition-all hover:border-gray-400 ${color}`}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</p>
                {icon}
            </div>
            <p className="text-2xl font-serif font-bold truncate">{value}</p>
            <p className="text-[10px] font-mono mt-1 uppercase tracking-wider opacity-60">{sub}</p>
        </div>
    );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-gray-600 hover:bg-[#faf8f5] rounded-none border border-gray-200 transition-all font-semibold uppercase tracking-widest hover:border-black hover:text-black"
        >
            {icon}
            {label}
        </Link>
    );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface OrderPaymentInfo {
    id: string;
    orderCode: number;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    payosQrCode: string;
    payosAccountNumber: string;
    payosAccountName: string;
    payosBin: string;
    payosCheckoutUrl: string;
}

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [order, setOrder] = useState<OrderPaymentInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (!orderId) {
            toast.error("Không tìm thấy thông tin đơn hàng!");
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/order/payment-details?id=${orderId}`);
                const data = await res.json();
                if (res.ok && data.success) {
                    setOrder(data.order);
                    if (data.order.status === "PROCESSING") {
                        router.push(`/checkout/success?orderCode=${data.order.orderCode}`);
                    } else if (data.order.status === "CANCELLED") {
                        router.push(`/checkout/cancel?orderCode=${data.order.orderCode}`);
                    }
                } else {
                    toast.error(data.message || "Không thể tải thông tin đơn hàng.");
                }
            } catch (error) {
                console.error("Lỗi fetch đơn hàng:", error);
                toast.error("Lỗi kết nối mạng khi tải thông tin đơn hàng.");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchDetails();
    }, [orderId, router]);



    // Polling order status
    useEffect(() => {
        if (!orderId || !order || order.status !== "PENDING") return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/order/status?id=${orderId}`);
                const data = await res.json();
                if (res.ok && data.success) {
                    if (data.status === "PROCESSING") {
                        clearInterval(interval);
                        toast.success("Thanh toán thành công!");
                        router.push(`/checkout/success?orderCode=${data.orderCode}`);
                    } else if (data.status === "CANCELLED") {
                        clearInterval(interval);
                        toast.info("Đơn hàng của bạn đã bị hủy.");
                        router.push(`/checkout/cancel?orderCode=${data.orderCode}`);
                    }
                }
            } catch (error) {
                console.error("Lỗi kiểm tra trạng thái đơn hàng:", error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [orderId, order, router]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Đã sao chép ${label}!`);
    };

    const handleCancelOrder = async () => {
        if (!orderId || !order) return;
        if (!confirm("Bạn có chắc chắn muốn hủy thanh toán và hủy đơn hàng này không?")) return;

        setIsCancelling(true);
        try {
            const res = await fetch("/api/order/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: orderId, action: "CANCEL" }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.info("Đã hủy đơn hàng.");
                router.push(`/checkout/cancel?orderCode=${order.orderCode}`);
            } else {
                toast.error(data.message || "Không thể hủy đơn hàng.");
            }
        } catch (error) {
            console.error("Lỗi khi hủy đơn:", error);
            toast.error("Lỗi mạng, vui lòng thử lại.");
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-xl w-full bg-white p-8 lg:p-10 border border-gray-100 rounded-2xl shadow-lg text-center">
                <div className="animate-pulse space-y-6">
                    <div className="h-6 bg-gray-100 w-1/2 mx-auto rounded-full"></div>
                    <div className="h-4 bg-gray-100 w-1/3 mx-auto rounded-full"></div>
                    <div className="w-[200px] h-[200px] bg-gray-100 mx-auto rounded-xl"></div>
                    <div className="h-12 bg-gray-100 w-full rounded-xl"></div>
                </div>
                <p className="text-sm text-gray-400 mt-6 font-medium">Đang tải thông tin thanh toán...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-md w-full bg-white p-10 border border-gray-100 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">✕</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Lỗi tải thông tin</h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">Không thể tìm thấy hoặc tải thông tin đơn hàng này.</p>
                <Link href="/checkout" className="block w-full py-4 bg-[#333] hover:bg-black text-white text-xs tracking-[0.2em] uppercase rounded-xl transition-all font-semibold text-center">
                    Quay lại Thanh toán
                </Link>
            </div>
        );
    }

    const transferContent = `Thanh toan Bamboo #${order.orderCode}`;

    return (
        <div className="max-w-4xl w-full bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-gray-100">
            <header className="mb-8 border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Thanh toán chuyển khoản QR</h1>
                    <p className="text-sm text-gray-500 mt-1">Đơn hàng của bạn đã được ghi nhận. Vui lòng quét mã hoặc chuyển khoản để hoàn tất.</p>
                </div>
                <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto border border-amber-100">
                    MÃ ĐƠN: #{order.orderCode}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-8 border border-gray-200 rounded-2xl bg-gray-50/30 w-full">
                    {order.payosQrCode ? (
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(order.payosQrCode)}`}
                                alt="VietQR Code"
                                className="w-48 h-48 block"
                            />
                        </div>
                    ) : (
                        <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded-xl mb-4">
                            Không thể tải QR
                        </div>
                    )}
                    <p className="text-xs text-gray-500 text-center font-medium">Sử dụng ứng dụng ngân hàng để quét mã VietQR</p>
                </div>

                {/* Transfer Details */}
                <div className="space-y-4 text-sm">
                    <div className="border-b border-gray-100 pb-3">
                        <p className="text-gray-500 text-xs uppercase font-medium">Ngân hàng</p>
                        <p className="text-gray-800 font-semibold mt-1">
                            {order.payosBin === "970415" ? "VietinBank (ICB)" : `Ngân hàng (BIN: ${order.payosBin})`}
                        </p>
                    </div>

                    <div className="border-b border-gray-100 pb-3 flex justify-between items-center gap-4">
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-medium">Số tài khoản</p>
                            <p className="text-gray-900 font-bold mt-1 font-mono text-base tracking-wide">{order.payosAccountNumber}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(order.payosAccountNumber, "Số tài khoản")}
                            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black rounded-md px-2 py-1 text-xs font-medium transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                            Sao chép
                        </button>
                    </div>

                    <div className="border-b border-gray-100 pb-3">
                        <p className="text-gray-500 text-xs uppercase font-medium">Tên chủ tài khoản</p>
                        <p className="text-gray-800 font-semibold mt-1 uppercase tracking-wide">{order.payosAccountName}</p>
                    </div>

                    <div className="border-b border-gray-100 pb-3 flex justify-between items-center gap-4">
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-medium">Số tiền thanh toán</p>
                            <p className="text-amber-600 font-bold mt-1 text-2xl font-sans">
                                {order.totalAmount.toLocaleString("vi-VN")}đ
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(String(order.totalAmount), "Số tiền")}
                            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black rounded-md px-2 py-1 text-xs font-medium transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                            Sao chép
                        </button>
                    </div>

                    <div className="border-b border-gray-100 pb-3 flex justify-between items-center gap-4">
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-medium">Nội dung chuyển khoản</p>
                            <p className="text-gray-800 font-semibold mt-1 font-mono bg-gray-50 px-2.5 py-1 border border-gray-100 rounded-md text-[13px] select-all">
                                {transferContent}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(transferContent, "Nội dung chuyển")}
                            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black rounded-md px-2 py-1 text-xs font-medium transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                            Sao chép
                        </button>
                    </div>
                </div>
            </div>

            {/* Waiting loader & actions */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2.5 py-3 text-sm text-gray-500 bg-gray-50/50 rounded-xl border border-gray-100/60">
                    <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium text-gray-500">Đang chờ giao dịch...</span>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleCancelOrder}
                        disabled={isCancelling}
                        className="w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCancelling ? "ĐANG HỦY ĐƠN..." : "HỦY THANH TOÁN"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPaymentPage() {
    return (
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center pt-32 px-6 pb-24">
            <Suspense fallback={
                <div className="max-w-xl w-full bg-white p-8 lg:p-10 border border-gray-100 rounded-2xl shadow-lg text-center animate-pulse">
                    <p className="text-sm text-gray-400">Đang tải...</p>
                </div>
            }>
                <PaymentContent />
            </Suspense>
        </div>
    );
}

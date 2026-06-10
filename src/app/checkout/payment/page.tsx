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

    const handleDownloadQR = async () => {
        if (!order?.payosQrCode) return;
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(order.payosQrCode)}`;
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `VietQR-Order-${order.orderCode}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Đã tải mã QR về máy!");
        } catch (error) {
            console.error("Lỗi tải ảnh QR:", error);
            toast.error("Không thể tải ảnh QR. Vui lòng chụp màn hình lại.");
        }
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
            <div className="max-w-xl w-full bg-white p-8 lg:p-10 border border-gray-200 rounded-none shadow-none text-center">
                <div className="animate-pulse space-y-6">
                    <div className="h-5 bg-gray-100 w-1/2 mx-auto"></div>
                    <div className="h-3.5 bg-gray-100 w-1/3 mx-auto"></div>
                    <div className="w-[200px] h-[200px] bg-gray-100 mx-auto border border-gray-200"></div>
                    <div className="h-12 bg-gray-100 w-full"></div>
                </div>
                <p className="text-xs text-gray-400 mt-6 uppercase tracking-widest font-medium">Đang tải thông tin thanh toán...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-md w-full bg-white p-10 border border-gray-200 rounded-none shadow-none text-center">
                <div className="w-12 h-12 border border-red-200 text-red-500 flex items-center justify-center mx-auto mb-6 text-xl">✕</div>
                <h2 className="text-lg font-serif text-[#333] mb-3">Lỗi tải thông tin</h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">Không thể tìm thấy hoặc tải thông tin đơn hàng này.</p>
                <Link href="/checkout" className="block w-full py-4 bg-[#333] hover:bg-black text-white text-xs tracking-[0.2em] uppercase rounded-none transition-colors text-center font-semibold">
                    Quay lại Thanh toán
                </Link>
            </div>
        );
    }

    const transferContent = `Thanh toan Bamboo #${order.orderCode}`;

    return (
        <div className="max-w-4xl w-full bg-white p-6 md:p-10 border border-gray-200 rounded-none shadow-none">
            <header className="mb-8 border-b border-gray-200 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif text-[#333]">Thanh toán chuyển khoản QR</h1>
                    <p className="text-xs text-gray-400 mt-2 tracking-wide font-light">Đơn hàng của bạn đã được ghi nhận. Vui lòng quét mã hoặc chuyển khoản để hoàn tất.</p>
                </div>
                <div className="border border-gray-200 text-gray-500 px-3 py-1.5 text-xs tracking-widest font-mono uppercase bg-white rounded-none self-start sm:self-auto">
                    MÃ ĐƠN: #{order.orderCode}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-8">
                {/* QR Code Container with Camera Focus Frame */}
                <div className="flex flex-col items-center justify-center p-8 border border-gray-200 rounded-none bg-[#faf8f5] w-full">
                    <div className="relative p-6 bg-white border border-gray-100 shadow-none mb-6">
                        {/* Corner brackets simulating scanner focus */}
                        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-emerald-800"></div>
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-emerald-800"></div>
                        <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-emerald-800"></div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-emerald-800"></div>

                        {/* Top tag inside the frame */}
                        <div className="text-center mb-3 text-[9px] tracking-[0.2em] font-mono text-gray-400 uppercase">
                            VietQR / NAPAS
                        </div>

                        {/* QR Image */}
                        {order.payosQrCode ? (
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(order.payosQrCode)}`}
                                alt="VietQR Code"
                                className="w-48 h-48 block mx-auto grayscale-[15%] hover:grayscale-0 transition-all duration-300"
                            />
                        ) : (
                            <div className="w-48 h-48 bg-white border border-gray-200 flex items-center justify-center text-xs text-gray-400 rounded-none">
                                Không thể tải QR
                            </div>
                        )}

                        {/* Bottom action/partners inside the frame */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5 text-[9px] tracking-wider text-gray-400 font-bold uppercase">
                                <span>Napas247</span>
                                <span className="text-gray-300 font-normal">|</span>
                                <span>VietQR</span>
                            </div>

                            <button
                                type="button"
                                onClick={handleDownloadQR}
                                className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-black transition-colors"
                                title="Tải mã QR về máy"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" x2="12" y1="15" y2="3"/>
                                </svg>
                                <span className="uppercase tracking-widest text-[9px] font-bold">Tải về</span>
                            </button>
                        </div>
                    </div>
                    <p className="text-[10px] tracking-widest uppercase text-gray-400 text-center font-medium">Sử dụng ứng dụng ngân hàng để quét mã VietQR</p>
                </div>

                {/* Transfer Details */}
                <div className="space-y-5 text-sm">
                    <div className="border-b border-gray-200 pb-3.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ngân hàng</p>
                        <p className="text-[#333] font-medium mt-1">
                            {order.payosBin === "970415" ? "VietinBank (ICB)" : `Ngân hàng (BIN: ${order.payosBin})`}
                        </p>
                    </div>

                    <div className="border-b border-gray-200 pb-3.5 flex justify-between items-center gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số tài khoản</p>
                            <p className="text-[#333] font-semibold mt-1 font-mono text-base tracking-wide">{order.payosAccountNumber}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(order.payosAccountNumber, "Số tài khoản")}
                            className="flex items-center border border-gray-300 hover:border-black text-gray-500 hover:text-black rounded-none px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase transition-colors bg-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                            Sao chép
                        </button>
                    </div>

                    <div className="border-b border-gray-200 pb-3.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tên chủ tài khoản</p>
                        <p className="text-[#333] font-medium mt-1 uppercase tracking-wider">{order.payosAccountName}</p>
                    </div>

                    <div className="border-b border-gray-200 pb-3.5 flex justify-between items-center gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số tiền thanh toán</p>
                            <p className="text-2xl font-serif text-[#333] mt-1">
                                {order.totalAmount.toLocaleString("vi-VN")}đ
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(String(order.totalAmount), "Số tiền")}
                            className="flex items-center border border-gray-300 hover:border-black text-gray-500 hover:text-black rounded-none px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase transition-colors bg-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                            Sao chép
                        </button>
                    </div>

                    <div className="border-b border-gray-200 pb-3.5 flex justify-between items-center gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nội dung chuyển khoản</p>
                            <p className="text-[#333] font-semibold mt-1 font-mono bg-[#faf8f5] px-3 py-1.5 border border-gray-200 rounded-none text-xs select-all">
                                {transferContent}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(transferContent, "Nội dung chuyển")}
                            className="flex items-center border border-gray-300 hover:border-black text-gray-500 hover:text-black rounded-none px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase transition-colors bg-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                            Sao chép
                        </button>
                    </div>
                </div>
            </div>

            {/* Waiting loader & actions */}
            <div className="space-y-4 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-center gap-3 py-4 text-xs uppercase tracking-wider text-gray-500 bg-[#faf8f5] border border-gray-200 rounded-none">
                    <svg className="animate-spin h-3.5 w-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium tracking-widest">Đang chờ giao dịch...</span>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleCancelOrder}
                        disabled={isCancelling}
                        className="w-full py-4 border border-gray-300 text-gray-500 hover:border-red-500 hover:text-red-500 rounded-none text-xs tracking-[0.2em] uppercase transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="max-w-xl w-full bg-white p-8 lg:p-10 border border-gray-200 rounded-none shadow-none text-center animate-pulse">
                    <p className="text-xs uppercase tracking-wider text-gray-400">Đang tải...</p>
                </div>
            }>
                <PaymentContent />
            </Suspense>
        </div>
    );
}

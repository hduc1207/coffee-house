"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CancelContent() {
    const searchParams = useSearchParams();
    const orderCode = searchParams.get("orderCode");

    return (
        <div className="max-w-md w-full bg-white p-8 lg:p-10 border border-gray-200 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                ✕
            </div>
            <h1 className="text-3xl font-serif text-[#333] mb-4">Thanh toán chưa hoàn tất</h1>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Giao dịch thanh toán của bạn đã bị hủy hoặc gặp sự cố. 
                {orderCode && <span> Đơn hàng #{orderCode} vẫn chưa được thanh toán thành công.</span>}
                Bạn có thể thử thanh toán lại hoặc quay lại thay đổi phương thức thanh toán.
            </p>
            <div className="space-y-4">
                <Link href="/checkout" className="block w-full py-4 bg-[#333] hover:bg-black text-white text-xs tracking-[0.2em] uppercase transition-colors font-semibold">
                    Quay lại Trang Thanh toán
                </Link>
                <Link href="/menu" className="block w-full py-4 border border-gray-300 hover:border-gray-800 text-gray-700 text-xs tracking-[0.2em] uppercase transition-colors font-semibold">
                    Xem Thực Đơn
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center pt-32 px-6 pb-24">
            <Suspense fallback={
                <div className="max-w-md w-full bg-white p-8 border border-gray-200 text-center shadow-sm">
                    <p className="text-sm text-gray-500">Đang tải...</p>
                </div>
            }>
                <CancelContent />
            </Suspense>
        </div>
    );
}

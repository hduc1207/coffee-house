"use client";

import { useEffect, Suspense } from "react";
import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
    const { clearCart } = useCart();
    const searchParams = useSearchParams();
    const orderCode = searchParams.get("orderCode");

    useEffect(() => {
        const timer = setTimeout(() => {
            clearCart();
        }, 200);
        return () => clearTimeout(timer);
    }, [clearCart]);

    return (
        <div className="max-w-md w-full bg-white p-8 lg:p-10 border border-gray-200 text-center shadow-sm">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                ✓
            </div>
            <h1 className="text-3xl font-serif text-[#333] mb-4">Đặt hàng thành công!</h1>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Cảm ơn bạn đã lựa chọn The Bamboo. 
                {orderCode && <span> Đơn hàng mã số #{orderCode} của bạn đã được thanh toán thành công và đang được chuẩn bị.</span>}
                Chúng tôi sẽ liên hệ giao hàng sớm nhất có thể.
            </p>
            <div className="space-y-4">
                <a href="/menu" className="block w-full py-4 bg-[#333] hover:bg-black text-white text-sm tracking-wider uppercase transition-colors font-semibold rounded-lg">
                    Tiếp tục mua sắm
                </a>
                <a href="/account/orders" className="block w-full py-4 border border-gray-300 hover:border-gray-800 text-gray-700 text-sm tracking-wider uppercase transition-colors font-semibold rounded-lg">
                    Lịch sử đơn hàng
                </a>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center pt-32 px-6 pb-24">
            <Suspense fallback={
                <div className="max-w-md w-full bg-white p-8 border border-gray-200 text-center shadow-sm">
                    <p className="text-sm text-gray-500">Đang xử lý thông tin...</p>
                </div>
            }>
                <SuccessContent />
            </Suspense>
        </div>
    );
}

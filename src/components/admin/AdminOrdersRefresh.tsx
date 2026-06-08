"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrdersRefresh() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [autoRefresh, setAutoRefresh] = useState(true);

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            startTransition(() => {
                router.refresh();
            });
        }, 15000); // Tự động làm mới mỗi 15 giây

        return () => clearInterval(interval);
    }, [autoRefresh, router]);

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <input
                    type="checkbox"
                    id="auto-refresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="h-3.5 w-3.5 rounded-none border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <label htmlFor="auto-refresh" className="cursor-pointer font-medium select-none uppercase tracking-wider text-[10px]">
                    Tự động cập nhật (15s)
                </label>
            </div>

            <button
                type="button"
                onClick={handleRefresh}
                disabled={isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 bg-white border border-gray-200 rounded-none hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
            >
                <svg
                    className={`h-3.5 w-3.5 text-gray-500 ${isPending ? "animate-spin" : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3"
                    />
                </svg>
                {isPending ? "Đang tải..." : "Tải lại"}
            </button>
        </div>
    );
}

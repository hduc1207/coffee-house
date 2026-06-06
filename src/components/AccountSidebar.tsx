"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

interface AccountSidebarProps {
    userName: string;
}

export default function AccountSidebar({ userName }: AccountSidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? "font-bold" : "hover:text-gray-500";
    };

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <h2 className="text-xl mb-8 font-medium">Xin chào,<br /><span className="block mt-1">{userName || "Khách hàng"}</span></h2>

            <nav className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium mb-4">Tài khoản của bạn</h3>
                    <ul className="space-y-3 text-sm">
                        <li>
                            <Link href="/account" className={`flex justify-between ${isActive("/account")}`}>
                                Cài đặt tài khoản <span>›</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/account/orders" className={`flex justify-between ${isActive("/account/orders")}`}>
                                Lịch sử đơn hàng <span>›</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/account/address" className={`flex justify-between ${isActive("/account/address")}`}>
                                Sổ địa chỉ <span>›</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="pt-4">
                    <LogoutButton />
                </div>
            </nav>
        </aside>
    );
}

"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ 
                redirect: true,
                callbackUrl: "/" 
            })}
            className="w-full bg-[#333] text-white py-3 text-sm font-medium hover:bg-black transition-colors"
        >
            Đăng xuất
        </button>
    );
}

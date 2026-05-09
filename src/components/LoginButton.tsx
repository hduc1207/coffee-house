"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginButton({ className }: { className?: string }) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div className={`animate-pulse bg-gray-200 h-4 w-16 rounded ${className || ""}`}></div>;
    }

    if (session) {
        return (
            <Link href="/account" className={className}>
                Tài khoản
            </Link>
        );
    }

    return (
        <button
            onClick={() => signIn(undefined, { 
                redirect: true,
                callbackUrl: "/"
            })}
            className={className}
        >
            Đăng nhập
        </button>
    );
}
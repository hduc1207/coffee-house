"use client";

import { usePathname } from "next/navigation";

export default function ConditionalLayout({
                                              children,
                                              header,
                                              footer,
                                          }: {
    children: React.ReactNode;
    header: React.ReactNode;
    footer: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");
    if (isAdmin) {
        return <>{children}</>;
    }
    return (
        <>
            {header}
            {children}
            {footer}
        </>
    );
}
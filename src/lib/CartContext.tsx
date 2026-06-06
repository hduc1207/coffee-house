"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {Product} from "@prisma/client";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Product) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    totalPrice: number;
    clearCart: () => void;
    isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "coffee-house:cart";

function isCartItemArray(value: unknown): value is CartItem[] {
    return (
        Array.isArray(value) &&
        value.every(
            (item) =>
                item &&
                typeof item === "object" &&
                typeof (item as CartItem).id === "string" &&
                typeof (item as CartItem).name === "string" &&
                typeof (item as CartItem).price === "number" &&
                typeof (item as CartItem).quantity === "number",
        )
    );
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydrate từ localStorage 1 lần khi mount (client-only)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (isCartItemArray(parsed)) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setCartItems(parsed);
                }
            }
        } catch (err) {
            console.warn("Không thể đọc cart từ localStorage:", err);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    // Persist mỗi khi cart thay đổi (chỉ sau khi đã hydrate xong
    // để tránh ghi đè cart cũ bằng [] trong lần render đầu).
    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
        } catch (err) {
            console.warn("Không thể lưu cart vào localStorage:", err);
        }
    }, [cartItems, isHydrated]);

    const addToCart = (product: Product) => {
        setCartItems((prev) => {
            const existingItem = prev.find((item) => item.id === product.id);
            if (existingItem) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, 99) } : item
                );
            }

            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (id: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };
    const updateQuantity = (id: string, delta: number) => {
        setCartItems((prev) =>
            prev.reduce((acc, item) => {
                if (item.id === id) {
                    const newQuantity = item.quantity + delta;
                    if (newQuantity <= 0) return acc;
                    if (newQuantity > 99) {
                        acc.push(item);
                        return acc;
                    }
                    acc.push({ ...item, quantity: newQuantity });
                    return acc;
                }
                acc.push(item);
                return acc;
            }, [] as CartItem[])
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, totalPrice, clearCart, isHydrated }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
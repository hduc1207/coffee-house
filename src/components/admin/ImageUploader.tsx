"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUploader({ value, onChange, label = "Ảnh" }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError("");
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (res.ok && data.success) {
                onChange(data.url);
            } else {
                setError(data.message ?? "Upload thất bại");
            }
        } catch {
            setError("Lỗi mạng khi upload ảnh");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</label>

            {/* Preview */}
            {value && (
                <div className="relative w-full h-40 rounded-none overflow-hidden border border-gray-200 mb-3 bg-gray-50">
                    <Image src={getImageUrl(value)} alt="Preview" fill className="object-cover" unoptimized />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-2 right-2 bg-black text-white rounded-none w-6 h-6 flex items-center justify-center text-[10px] hover:bg-neutral-850 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border border-dashed border-gray-300 rounded-none p-6 text-center hover:border-gray-400 transition-colors cursor-pointer bg-[#faf8f5]/20"
                onClick={() => fileRef.current?.click()}
            >
                {isUploading ? (
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-sm">Đang upload...</span>
                    </div>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-400">Kéo thả ảnh vào đây hoặc <span className="text-[#6F4E37] font-medium">chọn file</span></p>
                        <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP — tối đa 5MB</p>
                    </>
                )}
            </div>

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />

            {/* URL Input fallback */}
            <div className="mt-2">
                <input
                    type="text"
                    placeholder="Hoặc nhập URL ảnh trực tiếp..."
                    value={value.startsWith("/uploads/") ? "" : value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-none text-gray-600 placeholder-gray-350 focus:outline-none focus:border-black bg-white"
                />
            </div>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

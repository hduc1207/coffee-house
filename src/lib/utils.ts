export function getImageUrl(src: string | null | undefined): string {
    if (!src) {
        return "/images/Cafe-sua-da.jpg"; // fallback placeholder
    }
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
        return src;
    }
    // For relative paths: ensure a leading slash
    if (src.startsWith("/")) {
        return src;
    }
    return `/${src}`;
}

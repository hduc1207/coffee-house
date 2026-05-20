import { z } from "zod";

// ============================================================
// XSS SANITIZATION
// ============================================================

/**
 * Loại bỏ HTML tags và các pattern XSS phổ biến khỏi chuỗi đầu vào.
 * Dùng trong .transform() của Zod schema để sanitize dữ liệu text.
 *
 * Cách hoạt động:
 * 1. Loại bỏ mọi thẻ HTML <...> kể cả self-closing
 * 2. Loại bỏ các event handler inline (onerror, onload, onclick...)
 * 3. Loại bỏ javascript: protocol trong URL
 * 4. Trim whitespace thừa
 *
 * Lưu ý: Đây là giải pháp phòng thủ cơ bản. Trong production,
 * nên dùng thêm DOMPurify (client-side) hoặc sanitize-html (server-side).
 */
function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")               // Loại bỏ mọi HTML tag
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")  // Loại bỏ event handler (onerror, onclick...)
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")  // Loại bỏ event handler single-quote
    .replace(/javascript\s*:/gi, "")        // Loại bỏ javascript: protocol
    .replace(/\s+/g, " ")                   // Chuẩn hóa khoảng trắng
    .trim();
}

/**
 * Zod transform helper: sanitize string chống XSS.
 * Dùng: z.string().transform(sanitizeText)
 */
const safeString = z.string().transform(sanitizeText);

// ============================================================
// REGISTER SCHEMA
// ============================================================

export const RegisterSchema = z.object({
  firstName: z
    .string()
    .min(1, "Tên không được trống")
    .max(50, "Tên tối đa 50 ký tự")
    .transform(sanitizeText),

  lastName: z
    .string()
    .max(50, "Họ tối đa 50 ký tự")
    .transform(sanitizeText)
    .default(""),

  email: z
    .string()
    .email("Email không hợp lệ")
    .max(255, "Email tối đa 255 ký tự")
    .transform((v) => v.trim().toLowerCase()),

  password: z
    .string()
    .min(8, "Mật khẩu phải ít nhất 8 ký tự")
    .max(100, "Mật khẩu tối đa 100 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
    .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// ============================================================
// USER PROFILE SCHEMA
// ============================================================

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Tên không được trống")
    .max(100, "Tên tối đa 100 ký tự")
    .transform(sanitizeText),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ============================================================
// ADDRESS SCHEMAS
// ============================================================

export const CreateAddressSchema = z.object({
  name: z
    .string()
    .min(1, "Tên người nhận không được trống")
    .max(100, "Tên người nhận tối đa 100 ký tự")
    .transform(sanitizeText),

  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ (VD: 0909123456 hoặc +84909123456)")
    .transform((v) => v.trim()),

  street: z
    .string()
    .min(5, "Địa chỉ phải ít nhất 5 ký tự")
    .max(500, "Địa chỉ tối đa 500 ký tự")
    .transform(sanitizeText),
});

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;

export const UpdateAddressSchema = z.object({
  id: z.string().min(1, "Thiếu ID địa chỉ"),

  name: z
    .string()
    .min(1, "Tên người nhận không được trống")
    .max(100, "Tên người nhận tối đa 100 ký tự")
    .transform(sanitizeText),

  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ (VD: 0909123456 hoặc +84909123456)")
    .transform((v) => v.trim()),

  street: z
    .string()
    .min(5, "Địa chỉ phải ít nhất 5 ký tự")
    .max(500, "Địa chỉ tối đa 500 ký tự")
    .transform(sanitizeText),
});

export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;

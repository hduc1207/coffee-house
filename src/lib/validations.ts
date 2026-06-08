import { z } from "zod";

function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

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

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Tên không được trống")
    .max(100, "Tên tối đa 100 ký tự")
    .transform(sanitizeText),

  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ")
    .transform((v) => v.trim()),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const CreateAddressSchema = z.object({
  name: z
    .string()
    .min(1, "Tên người nhận không được trống")
    .max(100, "Tên người nhận tối đa 100 ký tự")
    .transform(sanitizeText),

  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ")
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
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ")
    .transform((v) => v.trim()),

  street: z
    .string()
    .min(5, "Địa chỉ phải ít nhất 5 ký tự")
    .max(500, "Địa chỉ tối đa 500 ký tự")
    .transform(sanitizeText),
});

export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;

export const OrderItemSchema = z.object({
    id: z.string().uuid("ID sản phẩm không hợp lệ"),
    name: z.string().min(1, "Tên sản phẩm không được trống").max(200),
    price: z.number().int("Giá phải là số nguyên").positive("Giá phải > 0"),
    quantity: z.number().int("Số lượng phải là số nguyên")
        .positive("Số lượng phải >= 1")
        .max(99, "Số lượng tối đa 99/món"),
});

export const CreateOrderSchema = z.object({
    customerName: z.string()
        .min(2, "Tên khách hàng phải ít nhất 2 ký tự")
        .max(100, "Tên khách hàng tối đa 100 ký tự")
        .transform(sanitizeText),

    phone: z.string()
        .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ")
        .trim(),

    address: z.string()
        .min(5, "Địa chỉ phải ít nhất 5 ký tự")
        .max(500, "Địa chỉ tối đa 500 ký tự")
        .transform(sanitizeText),

    notes: z.string()
        .max(500, "Ghi chú tối đa 500 ký tự")
        .optional()
        .default("")
        .transform(sanitizeText),

    deliveryMethod: z.enum(["delivery", "pickup"]),

    paymentMethod: z.enum(["cod", "payos"]),

    totalAmount: z.number()
        .int("Tổng tiền phải là số nguyên")
        .positive("Tổng tiền phải > 0"),

    items: z.array(OrderItemSchema)
        .min(1, "Giỏ hàng phải có ít nhất 1 sản phẩm"),

    voucherCode: z.string()
        .trim()
        .toUpperCase()
        .min(3, "Mã giảm giá phải ít nhất 3 ký tự")
        .max(30, "Mã giảm giá tối đa 30 ký tự")
        .regex(/^[A-Z0-9_-]+$/, "Mã giảm giá chỉ chứa chữ, số, _ và -")
        .optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

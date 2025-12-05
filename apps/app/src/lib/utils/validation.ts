import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .email('Format email tidak valid')
  .min(1, 'Email wajib diisi');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka');

// Simple password (for login)
export const simplePasswordSchema = z
  .string()
  .min(1, 'Password wajib diisi');

// Phone number validation (Indonesian)
export const phoneSchema = z
  .string()
  .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid')
  .optional()
  .or(z.literal(''));

// Transaction amount validation
export const amountSchema = z
  .number()
  .positive('Jumlah harus lebih dari 0')
  .max(999999999999, 'Jumlah terlalu besar');

// Transaction description validation
export const descriptionSchema = z
  .string()
  .min(1, 'Deskripsi wajib diisi')
  .max(500, 'Deskripsi maksimal 500 karakter');

// User registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Nama minimal 2 karakter'),
  businessName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

// User login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
});

// Transaction schema
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: amountSchema,
  description: descriptionSchema,
  category: z.string().min(1, 'Kategori wajib dipilih'),
  source: z.enum(['voice', 'manual', 'ocr', 'whatsapp']).default('manual'),
  rawInput: z.string().optional(),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  displayName: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  businessName: z.string().optional(),
  phoneNumber: phoneSchema,
});

// Validate and return errors
export const validateWithErrors = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return { success: false, errors };
};

// Sanitize string input
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove angle brackets
};

// Sanitize object values
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(sanitized[key] as string);
    }
  }
  
  return sanitized;
};

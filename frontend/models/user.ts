import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max size

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

export const signSchema = z.object({
    email: z.string().email("Email is invalid"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const completeProfileSchema = z.object({
  username: z
    .string()
    .min(2, "username must be at least 2 characters")
    .max(14, "username must be less than 14 characters"),
  
  avatar: z
    .instanceof(File)
    .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Invalid file type. Only jpeg, png, webp, svg, gif allowed.",
    })
    .refine(file => file.size <= MAX_FILE_SIZE, {
      message: "File size must be less than 5MB.",
    })
});

export const userSchema = signSchema.extend({
    id: z
    .number()
    .optional(),
    baner: z
    .any()
    .optional(),
    fact2Auth: z
    .boolean()
    .optional(),
    level: z
    .number()
    .optional(),
    XP: z
    .number()
    .optional(),
    wins:  z
    .number()
    .optional(),
    loses: z
    .number()
    .optional()
});

import { z } from 'zod';


export const signSchema = z.object({
    email: z.string().email("Email is invalid"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// export const completeProfileSchema = z.object({
//   username: z.string()
//     .min(3, "Username must be at least 3 characters")
//     .max(20, "Username must be less than 20 characters")
//     .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
//   image: z.string()
//     .url("Invalid image URL")
//     .min(1, "Please upload an avatar image"),
// })


export const completeProfileSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  avatar: z.string()
    .min(1, "Please upload an avatar image")
    .optional()
    .default("/img/a.jpeg"), // Set default value
})

export const userSchema = completeProfileSchema.extend({
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

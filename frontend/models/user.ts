import { number, z } from 'zod';
import axios from '@/lib/axios';

const MAX_FILE_SIZE = 2500000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const signSchema = z.object({
    email: z.string().email("Email is invalid"),
    password: z.string().min(6, "Password must be at least 6 characters"),
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

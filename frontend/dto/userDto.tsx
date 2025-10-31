import {z } from 'zod';
import { signSchema, userSchema} from "@/models/user";

type userDto = z.infer<typeof userSchema>

type signDto = z.infer<typeof signSchema>

export type {userDto, signDto};

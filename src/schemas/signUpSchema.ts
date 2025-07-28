import { z } from 'zod';

export const usernameValidation = z
    .string()
    .min(3, "Min 2 charecters required in Username")
    .max(20, "Username can't be of more than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/,"Username can't have special characters")


export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Min 6 characters required"})
})
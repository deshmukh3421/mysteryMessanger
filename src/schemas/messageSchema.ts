import {z} from 'zod';

export const msageSchema = z.object({
    content: z
    .string()
    .min(10, {message: "Context must be of minimum 10 characters"})
    .max(200, {message: "Context can't be of more than 200 characters"})
})
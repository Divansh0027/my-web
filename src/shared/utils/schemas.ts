import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const propertySchema = z.object({
  title: z.string().min(10),
  description: z.string().min(30),
  price: z.number().positive(),
  area: z.number().positive(),
})

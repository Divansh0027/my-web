import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  price: z.number().positive("Price must be positive"),
  city: z.string().min(1, "City is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["Plot", "Commercial", "Flat", "Villa", "Builder Floor"]),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

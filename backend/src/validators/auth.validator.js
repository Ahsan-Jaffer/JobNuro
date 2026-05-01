import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(60, "Name cannot exceed 60 characters"),

    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters long")
      .max(72, "Password cannot exceed 72 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    password: z.string({
      required_error: "Password is required",
    }),
  }),
});
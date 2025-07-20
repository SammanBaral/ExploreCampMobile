import { z } from "zod";

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().max(50).optional(),
  bio: z.string().max(200).optional(),
  location: z.string().max(100),
});

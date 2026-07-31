import { z } from "zod";

export const CreateCommunitySchema = z.object({
  name: z
    .string()
    .min(3, "Subverse name must be at least 3 characters")
    .max(21, "Subverse name cannot exceed 21 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Subverse name can only contain letters, numbers, and underscores"
    ),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export type CreateCommunityRequest = z.infer<typeof CreateCommunitySchema>;

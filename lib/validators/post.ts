import { z } from "zod";

export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(300, "Title cannot exceed 300 characters"),
  content: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  linkUrl: z.string().url("Invalid web link URL").optional().or(z.literal("")),
  communityId: z.string().min(1, "Community selection is required"),
});

export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content cannot be empty")
    .max(2000, "Comment cannot exceed 2000 characters"),
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().optional(),
});

export const VoteSchema = z.object({
  voteType: z.enum(["UP", "DOWN"]),
});

export type CreatePostRequest = z.infer<typeof CreatePostSchema>;
export type CreateCommentRequest = z.infer<typeof CreateCommentSchema>;
export type VoteRequest = z.infer<typeof VoteSchema>;

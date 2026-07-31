"use client";

import { MessageSquare, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { CommentData, CommentItem } from "./CommentItem";

interface CommentFeedProps {
  postId: string;
  initialComments: CommentData[];
  onOpenAuth: () => void;
}

export function CommentFeed({
  postId,
  initialComments,
  onOpenAuth,
}: CommentFeedProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      onOpenAuth();
      return;
    }

    if (!content.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit comment");
      }

      setComments([data, ...comments]);
      setContent("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-[#343536]">
      {/* Comment Input Header */}
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <MessageSquare className="w-4 h-4 text-brand" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <textarea
          rows={3}
          placeholder={
            session?.user
              ? "What are your thoughts?"
              : "Log in or sign up to leave a comment..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!session?.user}
          className="w-full bg-[#272729] text-sm text-white placeholder-zinc-500 p-3 rounded-xl border border-[#343536] focus:border-brand focus:outline-none resize-none disabled:opacity-60"
        />

        <div className="flex justify-end">
          {session?.user ? (
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-2 rounded-full transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Posting..." : "Comment"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-2 rounded-full transition-colors"
            >
              Log In to Comment
            </button>
          )}
        </div>
      </form>

      {/* Comment Stream */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onOpenAuth={onOpenAuth}
          />
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-xs text-zinc-500 italic">
            No comments yet. Be the first to start the conversation!
          </div>
        )}
      </div>
    </div>
  );
}

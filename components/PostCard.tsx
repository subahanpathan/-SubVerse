"use client";

import { formatKarma, formatTimeToNow } from "@/lib/utils";
import {
  ArrowBigDown,
  ArrowBigUp,
  ExternalLink,
  MessageSquare,
  Share2,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export interface PostData {
  id: string;
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  createdAt: string | Date;
  author: {
    id: string;
    name: string | null;
    image?: string | null;
    karma?: number;
  };
  community: {
    id: string;
    name: string;
  };
  voteScore: number;
  currentVote: number;
  commentCount: number;
}

interface PostCardProps {
  post: PostData;
  onOpenAuth?: () => void;
  onDelete?: (id: string) => void;
}

export function PostCard({ post, onOpenAuth, onDelete }: PostCardProps) {
  const { data: session } = useSession();
  const [voteScore, setVoteScore] = useState(post.voteScore);
  const [currentVote, setCurrentVote] = useState(post.currentVote);
  const [voting, setVoting] = useState(false);

  const handleVote = async (direction: "UP" | "DOWN") => {
    if (!session?.user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (voting) return;
    setVoting(true);

    const targetValue = direction === "UP" ? 1 : -1;
    const isRemoving = currentVote === targetValue;
    const newVote = isRemoving ? 0 : targetValue;

    // Optimistic UI calculation
    let delta = 0;
    if (isRemoving) {
      delta = -targetValue;
    } else if (currentVote === 0) {
      delta = targetValue;
    } else {
      delta = targetValue * 2;
    }

    setCurrentVote(newVote);
    setVoteScore((prev) => prev + delta);

    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: direction }),
      });

      if (!res.ok) {
        // Revert optimistic update
        setCurrentVote(post.currentVote);
        setVoteScore(post.voteScore);
      } else {
        const data = await res.json();
        setVoteScore(data.voteScore);
        setCurrentVote(data.currentVote);
      }
    } catch {
      setCurrentVote(post.currentVote);
      setVoteScore(post.voteScore);
    } finally {
      setVoting(false);
    }
  };

  const isAuthor = session?.user?.id === post.author.id;

  return (
    <article className="bg-[#1A1A1B] border border-[#343536] hover:border-[#48494a] rounded-2xl p-4 shadow-sm transition-colors flex gap-3">
      {/* Vote Bar */}
      <div className="flex flex-col items-center bg-[#272729]/50 rounded-xl p-1.5 h-fit self-start border border-[#343536]/50">
        <button
          onClick={() => handleVote("UP")}
          className={`p-1 rounded-md transition-colors ${
            currentVote === 1
              ? "text-brand bg-brand/20"
              : "text-zinc-400 hover:text-brand hover:bg-[#343536]"
          }`}
          title="Upvote"
        >
          <ArrowBigUp className="w-6 h-6 fill-current" />
        </button>

        <span
          className={`text-xs font-bold my-0.5 ${
            currentVote === 1
              ? "text-brand"
              : currentVote === -1
              ? "text-blue-500"
              : "text-zinc-200"
          }`}
        >
          {formatKarma(voteScore)}
        </span>

        <button
          onClick={() => handleVote("DOWN")}
          className={`p-1 rounded-md transition-colors ${
            currentVote === -1
              ? "text-blue-500 bg-blue-500/20"
              : "text-zinc-400 hover:text-blue-500 hover:bg-[#343536]"
          }`}
          title="Downvote"
        >
          <ArrowBigDown className="w-6 h-6 fill-current" />
        </button>
      </div>

      {/* Main Post Content */}
      <div className="flex-1 space-y-2 min-w-0">
        {/* Post Metadata Header */}
        <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/r/${post.community.name}`}
              className="font-bold text-white hover:underline bg-brand/10 text-brand px-2 py-0.5 rounded-full text-[11px]"
            >
              r/{post.community.name}
            </Link>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Posted by</span>
            <Link
              href={`/user/${encodeURIComponent(post.author.name || post.author.id)}`}
              className="text-zinc-300 font-semibold hover:underline"
            >
              u/{post.author.name || "Anonymous"}
            </Link>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-500">
              {formatTimeToNow(post.createdAt)}
            </span>
          </div>

          {isAuthor && onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Post Title */}
        <h2 className="text-base font-bold text-white hover:text-brand transition-colors line-clamp-2">
          <Link href={`/r/${post.community.name}/comments/${post.id}`}>
            {post.title}
          </Link>
        </h2>

        {/* Text Content */}
        {post.content && (
          <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        )}

        {/* Image Preview */}
        {post.imageUrl && (
          <div className="relative mt-2 rounded-xl overflow-hidden border border-[#343536] max-h-96 bg-black/60 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={post.title}
              className="max-h-96 w-auto object-contain"
            />
          </div>
        )}

        {/* Link Button */}
        {post.linkUrl && (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-lg border border-brand/20 transition-colors mt-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="truncate max-w-md">{post.linkUrl}</span>
          </a>
        )}

        {/* Action Bar Footer */}
        <div className="flex items-center gap-4 pt-2 text-xs text-zinc-400 border-t border-[#343536]/50">
          <Link
            href={`/r/${post.community.name}/comments/${post.id}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors py-1"
          >
            <MessageSquare className="w-4 h-4 text-zinc-400" />
            <span>{post.commentCount} Comments</span>
          </Link>

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(
                  window.location.origin +
                    `/r/${post.community.name}/comments/${post.id}`
                );
                alert("Post link copied to clipboard!");
              }
            }}
            className="flex items-center gap-1.5 hover:text-white transition-colors py-1"
          >
            <Share2 className="w-4 h-4 text-zinc-400" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}

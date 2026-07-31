"use client";

import { formatTimeToNow } from "@/lib/utils";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export interface CommentData {
  id: string;
  content: string;
  createdAt: string | Date;
  author: {
    id: string;
    name: string | null;
    image?: string | null;
    karma?: number;
  };
  parentId?: string | null;
  voteScore: number;
  currentVote: number;
}

interface CommentItemProps {
  comment: CommentData;
  onOpenAuth?: () => void;
}

export function CommentItem({ comment, onOpenAuth }: CommentItemProps) {
  const { data: session } = useSession();
  const [voteScore, setVoteScore] = useState(comment.voteScore);
  const [currentVote, setCurrentVote] = useState(comment.currentVote);
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

    let delta = 0;
    if (isRemoving) delta = -targetValue;
    else if (currentVote === 0) delta = targetValue;
    else delta = targetValue * 2;

    setCurrentVote(newVote);
    setVoteScore((prev) => prev + delta);

    try {
      const res = await fetch(`/api/comments/${comment.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: direction }),
      });

      if (!res.ok) {
        setCurrentVote(comment.currentVote);
        setVoteScore(comment.voteScore);
      } else {
        const data = await res.json();
        setVoteScore(data.voteScore);
        setCurrentVote(data.currentVote);
      }
    } catch {
      setCurrentVote(comment.currentVote);
      setVoteScore(comment.voteScore);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="bg-[#272729]/40 border border-[#343536] rounded-xl p-3.5 space-y-2">
      {/* Comment Header */}
      <div className="flex items-center gap-2 text-xs">
        <div className="w-5 h-5 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold text-[10px]">
          {comment.author.name?.[0]?.toUpperCase() || "U"}
        </div>
        <Link
          href={`/user/${encodeURIComponent(comment.author.name || comment.author.id)}`}
          className="font-semibold text-zinc-200 hover:underline"
        >
          u/{comment.author.name || "Anonymous"}
        </Link>
        <span className="text-zinc-500">•</span>
        <span className="text-zinc-500">{formatTimeToNow(comment.createdAt)}</span>
      </div>

      {/* Content */}
      <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
        {comment.content}
      </p>

      {/* Voting Bar */}
      <div className="flex items-center gap-2 pt-1 text-xs">
        <div className="flex items-center gap-1 bg-[#1A1A1B] px-2 py-0.5 rounded-lg border border-[#343536]">
          <button
            onClick={() => handleVote("UP")}
            className={`p-0.5 rounded ${
              currentVote === 1
                ? "text-brand"
                : "text-zinc-400 hover:text-brand"
            }`}
          >
            <ArrowBigUp className="w-4 h-4 fill-current" />
          </button>

          <span className="font-semibold text-zinc-300 text-[11px]">
            {voteScore}
          </span>

          <button
            onClick={() => handleVote("DOWN")}
            className={`p-0.5 rounded ${
              currentVote === -1
                ? "text-blue-500"
                : "text-zinc-400 hover:text-blue-500"
            }`}
          >
            <ArrowBigDown className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}

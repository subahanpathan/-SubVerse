"use client";

import { AuthModal } from "@/components/AuthModal";
import { CommentFeed } from "@/components/CommentFeed";
import { CommentData } from "@/components/CommentItem";
import { formatKarma, formatTimeToNow } from "@/lib/utils";
import {
  ArrowBigDown,
  ArrowBigUp,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Share2,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface PostDetail {
  id: string;
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  createdAt: string;
  author: { id: string; name: string | null; image?: string | null; karma?: number };
  community: { id: string; name: string; description?: string | null };
  voteScore: number;
  currentVote: number;
  commentCount: number;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const communityName = params.name as string;
  const { data: session } = useSession();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteScore, setVoteScore] = useState(0);
  const [currentVote, setCurrentVote] = useState(0);
  const [voting, setVoting] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        fetch(`/api/posts/${postId}`),
        fetch(`/api/posts/${postId}/comments`),
      ]);

      const postData = await postRes.json();
      const commentsData = await commentsRes.json();

      if (postRes.ok) {
        setPost(postData);
        setVoteScore(postData.voteScore);
        setCurrentVote(postData.currentVote);
      }
      if (commentsRes.ok && Array.isArray(commentsData)) {
        setComments(commentsData);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleVote = async (direction: "UP" | "DOWN") => {
    if (!session?.user) {
      setAuthOpen(true);
      return;
    }
    if (voting || !post) return;
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
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: direction }),
      });

      if (res.ok) {
        const data = await res.json();
        setVoteScore(data.voteScore);
        setCurrentVote(data.currentVote);
      } else {
        setCurrentVote(post.currentVote);
        setVoteScore(post.voteScore);
      }
    } catch {
      setCurrentVote(post.currentVote);
      setVoteScore(post.voteScore);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <div className="h-8 bg-[#1A1A1B] rounded-xl animate-pulse" />
        <div className="h-64 bg-[#1A1A1B] rounded-2xl animate-pulse" />
        <div className="h-40 bg-[#1A1A1B] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-zinc-400 text-sm">Post not found or has been deleted.</p>
        <Link
          href={`/r/${communityName}`}
          className="mt-4 inline-block text-brand font-semibold text-xs hover:underline"
        >
          ← Back to r/{communityName}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Link
          href={`/r/${communityName}`}
          className="flex items-center gap-1.5 hover:text-brand transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          r/{communityName}
        </Link>
        <span className="text-zinc-600">•</span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3 text-brand" />
          <Link href={`/r/${communityName}`} className="hover:underline text-brand font-semibold">
            {post.community.name}
          </Link>
        </span>
      </div>

      {/* Post Detail Card */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl overflow-hidden shadow-xl">
        <div className="flex gap-4 p-5">
          {/* Vertical Vote Bar */}
          <div className="flex flex-col items-center bg-[#272729]/60 rounded-xl p-2 h-fit border border-[#343536]/50 gap-1">
            <button
              onClick={() => handleVote("UP")}
              className={`p-1.5 rounded-lg transition-colors ${
                currentVote === 1
                  ? "text-brand bg-brand/20"
                  : "text-zinc-400 hover:text-brand hover:bg-[#343536]"
              }`}
            >
              <ArrowBigUp className="w-7 h-7 fill-current" />
            </button>

            <span
              className={`text-sm font-extrabold ${
                currentVote === 1
                  ? "text-brand"
                  : currentVote === -1
                  ? "text-blue-500"
                  : "text-zinc-100"
              }`}
            >
              {formatKarma(voteScore)}
            </span>

            <button
              onClick={() => handleVote("DOWN")}
              className={`p-1.5 rounded-lg transition-colors ${
                currentVote === -1
                  ? "text-blue-500 bg-blue-500/20"
                  : "text-zinc-400 hover:text-blue-500 hover:bg-[#343536]"
              }`}
            >
              <ArrowBigDown className="w-7 h-7 fill-current" />
            </button>
          </div>

          {/* Post Content */}
          <div className="flex-1 space-y-3 min-w-0">
            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
              <Link
                href={`/user/${encodeURIComponent(post.author.name || post.author.id)}`}
                className="font-semibold text-zinc-200 hover:text-brand"
              >
                u/{post.author.name || "Anonymous"}
              </Link>
              <span className="text-zinc-600">•</span>
              <span>{formatTimeToNow(post.createdAt)}</span>
              {post.author.karma !== undefined && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-brand font-medium">
                    {formatKarma(post.author.karma)} karma
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl font-extrabold text-white leading-tight">
              {post.title}
            </h1>

            {/* Text Content */}
            {post.content && (
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            )}

            {/* Image */}
            {post.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-[#343536] max-h-[500px] bg-black/60 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="max-h-[500px] w-auto object-contain"
                />
              </div>
            )}

            {/* Link */}
            {post.linkUrl && (
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-lg border border-brand/20 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="truncate max-w-md">{post.linkUrl}</span>
              </a>
            )}

            {/* Action Bar */}
            <div className="flex items-center gap-4 pt-2 text-xs text-zinc-400 border-t border-[#343536]/50">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <span>{comments.length} Comments</span>
              </span>

              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Post link copied!");
                  }
                }}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Share2 className="w-4 h-4 text-zinc-400" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="px-5 pb-5">
          <CommentFeed
            postId={post.id}
            initialComments={comments}
            onOpenAuth={() => setAuthOpen(true)}
          />
        </div>
      </div>

      <AuthModal
        isOpen={authOpen}
        initialMode="login"
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}

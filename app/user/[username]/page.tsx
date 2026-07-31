"use client";

import { AuthModal } from "@/components/AuthModal";
import { CommentData } from "@/components/CommentItem";
import { PostCard, PostData } from "@/components/PostCard";
import { formatKarma, formatTimeToNow } from "@/lib/utils";
import { Award, Calendar, MessageSquare, Sparkles, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string | null;
  image?: string | null;
  karma: number;
  createdAt: string;
  posts: PostData[];
  comments: (CommentData & {
    post: { id: string; title: string; community: { name: string } };
    voteScore: number;
  })[];
}

export default function UserProfilePage() {
  const params = useParams();
  const username = decodeURIComponent(params.username as string);
  const { data: session } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [authOpen, setAuthOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}`);
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isOwnProfile = session?.user?.name === username || session?.user?.id === username;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <div className="h-32 bg-[#1A1A1B] rounded-2xl animate-pulse" />
        <div className="h-64 bg-[#1A1A1B] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-zinc-400">User not found.</p>
        <Link href="/" className="text-brand text-xs font-semibold hover:underline mt-4 block">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-brand/10 via-[#1A1A1B] to-[#1A1A1B] border border-[#343536] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand/20 text-brand flex items-center justify-center font-extrabold text-3xl border-2 border-brand/30 shadow-lg">
            {profile.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              u/{profile.name || "Anonymous"}
            </h1>
            {isOwnProfile && (
              <span className="inline-block bg-brand/20 text-brand text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1">
                Your Profile
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-[#272729] rounded-xl p-3 border border-[#343536]">
            <Sparkles className="w-4 h-4 text-brand mx-auto mb-1" />
            <p className="text-lg font-extrabold text-white">{formatKarma(profile.karma)}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Karma</p>
          </div>
          <div className="bg-[#272729] rounded-xl p-3 border border-[#343536]">
            <TrendingUp className="w-4 h-4 text-brand mx-auto mb-1" />
            <p className="text-lg font-extrabold text-white">{profile.posts.length}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Posts</p>
          </div>
          <div className="bg-[#272729] rounded-xl p-3 border border-[#343536]">
            <MessageSquare className="w-4 h-4 text-brand mx-auto mb-1" />
            <p className="text-lg font-extrabold text-white">{profile.comments.length}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Comments</p>
          </div>
        </div>
      </div>

      {/* Joined Date */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 px-1">
        <Calendar className="w-3.5 h-3.5 text-brand" />
        <span>Member since {formatTimeToNow(profile.createdAt)}</span>
        <span className="text-zinc-600">•</span>
        <Award className="w-3.5 h-3.5 text-brand" />
        <span className="text-brand font-semibold">{formatKarma(profile.karma)} karma</span>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-1.5 flex gap-1">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === "posts"
              ? "bg-brand text-white shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-[#272729]"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Posts ({profile.posts.length})
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === "comments"
              ? "bg-brand text-white shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-[#272729]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Comments ({profile.comments.length})
        </button>
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {profile.posts.length > 0 ? (
            profile.posts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, author: { id: profile.id, name: profile.name, image: profile.image } }}
                onOpenAuth={() => setAuthOpen(true)}
              />
            ))
          ) : (
            <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-10 text-center">
              <p className="text-zinc-400 text-sm">No posts yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === "comments" && (
        <div className="space-y-3">
          {profile.comments.length > 0 ? (
            profile.comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-4 space-y-2"
              >
                {/* Comment Context */}
                <div className="text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
                  <span>Commented in</span>
                  <Link
                    href={`/r/${comment.post.community.name}/comments/${comment.post.id}`}
                    className="text-brand font-semibold hover:underline"
                  >
                    {comment.post.title}
                  </Link>
                  <span className="text-zinc-600">•</span>
                  <span>{formatTimeToNow(comment.createdAt)}</span>
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                  {comment.content}
                </p>

                <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand" />
                  <span>{comment.voteScore} points</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-10 text-center">
              <p className="text-zinc-400 text-sm">No comments yet.</p>
            </div>
          )}
        </div>
      )}

      <AuthModal
        isOpen={authOpen}
        initialMode="login"
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}

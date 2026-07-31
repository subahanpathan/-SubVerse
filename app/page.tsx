"use client";

import { AuthModal } from "@/components/AuthModal";
import { CreateCommunityModal } from "@/components/CreateCommunityModal";
import { CreatePostModal } from "@/components/CreatePostModal";
import { PostCard, PostData } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export default function HomePage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"new" | "top">("new");

  const [authOpen, setAuthOpen] = useState(false);
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?sort=${sort}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch {
      // fallback silent error handling
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      }
    } catch {
      alert("Failed to delete post");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main Feed Column */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Quick Create Post Bar */}
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold text-sm shrink-0 border border-brand/30">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <button
              onClick={() => {
                if (session?.user) setCreatePostOpen(true);
                else setAuthOpen(true);
              }}
              className="flex-1 text-left bg-[#272729] hover:bg-[#343536] text-zinc-400 text-xs font-medium px-4 py-2.5 rounded-xl border border-transparent focus:outline-none transition-colors"
            >
              Create Post in a Subverse...
            </button>
          </div>

          {/* Feed Controls (Sorting) */}
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-2 flex items-center gap-2 text-xs font-semibold shadow-sm">
            <button
              onClick={() => setSort("new")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
                sort === "new"
                  ? "bg-brand text-white shadow-md"
                  : "text-zinc-400 hover:bg-[#272729] hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Newest</span>
            </button>

            <button
              onClick={() => setSort("top")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
                sort === "top"
                  ? "bg-brand text-white shadow-md"
                  : "text-zinc-400 hover:bg-[#272729] hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Top Voted</span>
            </button>
          </div>

          {/* Feed Post List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-6 h-40 animate-pulse flex items-center justify-center text-xs text-zinc-500"
                >
                  Loading feed posts...
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenAuth={() => setAuthOpen(true)}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-10 text-center space-y-3">
              <div className="bg-brand/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-brand">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Posts Yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Be the pioneer of SubVerse! Create the first community or post your thoughts.
              </p>
              <button
                onClick={() => {
                  if (session?.user) setCreatePostOpen(true);
                  else setAuthOpen(true);
                }}
                className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg transition-colors"
              >
                Create First Post
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar
          onOpenCreateCommunity={() => {
            if (session?.user) setCreateCommunityOpen(true);
            else setAuthOpen(true);
          }}
        />
      </div>

      {/* Local Modals */}
      <AuthModal
        isOpen={authOpen}
        initialMode="login"
        onClose={() => setAuthOpen(false)}
      />

      <CreateCommunityModal
        isOpen={createCommunityOpen}
        onClose={() => setCreateCommunityOpen(false)}
      />

      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />
    </div>
  );
}

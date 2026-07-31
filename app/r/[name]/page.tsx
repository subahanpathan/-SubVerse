"use client";

import { AuthModal } from "@/components/AuthModal";
import { CreateCommunityModal } from "@/components/CreateCommunityModal";
import { CreatePostModal } from "@/components/CreatePostModal";
import { PostCard, PostData } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { Flame, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface SubverseDetail {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  isJoined?: boolean;
}

export default function SubversePage() {
  const params = useParams();
  const communityName = (params.name as string) || "";
  const { data: session } = useSession();

  const [community, setCommunity] = useState<SubverseDetail | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  const [authOpen, setAuthOpen] = useState(false);
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch posts for subverse
      const postsRes = await fetch(
        `/api/posts?communityName=${encodeURIComponent(communityName)}`
      );
      const postsData = await postsRes.json();
      if (Array.isArray(postsData)) setPosts(postsData);

      // Fetch community info
      const commRes = await fetch("/api/communities");
      const commData = await commRes.json();
      if (Array.isArray(commData)) {
        const found = commData.find(
          (c) => c.name.toLowerCase() === communityName.toLowerCase()
        );
        if (found) {
          setCommunity(found);
          setMemberCount(found.memberCount || 0);

          // Check if joined
          if (session?.user) {
            const joinedRes = await fetch("/api/communities?filter=joined");
            const joinedData = await joinedRes.json();
            if (Array.isArray(joinedData)) {
              setIsJoined(joinedData.some((j) => j.id === found.id));
            }
          }
        }
      }
    } catch {
      // silent catch
    } finally {
      setLoading(false);
    }
  }, [communityName, session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleJoin = async () => {
    if (!session?.user) {
      setAuthOpen(true);
      return;
    }

    if (!community) return;

    const endpoint = isJoined
      ? `/api/communities/${community.id}/leave`
      : `/api/communities/${community.id}/join`;

    const nextState = !isJoined;
    setIsJoined(nextState);
    setMemberCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) {
        setIsJoined(!nextState);
        setMemberCount((prev) => (nextState ? prev - 1 : prev + 1));
      }
    } catch {
      setIsJoined(!nextState);
    }
  };

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
    <div>
      {/* Subverse Banner Header */}
      <div className="bg-gradient-to-r from-brand/20 via-[#1A1A1B] to-[#1A1A1B] border-b border-[#343536] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand text-white flex items-center justify-center font-bold text-2xl shadow-xl border-2 border-white/10 shrink-0">
              r/
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                r/{communityName}
              </h1>
              <p className="text-xs text-zinc-400 max-w-xl mt-1">
                {community?.description || `Welcome to the r/${communityName} community!`}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1 font-semibold text-zinc-200">
                  <Users className="w-3.5 h-3.5 text-brand" />
                  {memberCount} members
                </span>
                <span>•</span>
                <span>{posts.length} posts</span>
              </div>
            </div>
          </div>

          {/* Subverse Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleJoin}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-md ${
                isJoined
                  ? "bg-[#272729] hover:bg-red-500/20 text-zinc-200 hover:text-red-400 border border-[#343536]"
                  : "bg-brand hover:bg-brand-hover text-white"
              }`}
            >
              {isJoined ? "Joined Subverse" : "Join Subverse"}
            </button>

            <button
              onClick={() => {
                if (session?.user) setCreatePostOpen(true);
                else setAuthOpen(true);
              }}
              className="flex items-center gap-1.5 bg-[#272729] hover:bg-[#343536] text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-[#343536] transition-colors"
            >
              <Plus className="w-4 h-4 text-brand" />
              <span>Post in r/{communityName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Feed Column */}
          <div className="flex-1 space-y-4 min-w-0">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-6 h-40 animate-pulse flex items-center justify-center text-xs text-zinc-500"
                  >
                    Loading subverse posts...
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
                <h3 className="text-base font-bold text-white">
                  r/{communityName} is Quiet
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  There are no posts in this subverse yet. Share the first post!
                </p>
                <button
                  onClick={() => {
                    if (session?.user) setCreatePostOpen(true);
                    else setAuthOpen(true);
                  }}
                  className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg transition-colors"
                >
                  Post in r/{communityName}
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
      </div>

      {/* Modals */}
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
        defaultCommunityName={communityName}
        onClose={() => setCreatePostOpen(false)}
      />
    </div>
  );
}

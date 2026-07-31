"use client";

import { Compass, Home, PlusCircle, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SubverseItem {
  id: string;
  name: string;
  memberCount: number;
}

interface SidebarProps {
  onOpenCreateCommunity: () => void;
}

export function Sidebar({ onOpenCreateCommunity }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [trending, setTrending] = useState<SubverseItem[]>([]);
  const [joined, setJoined] = useState<SubverseItem[]>([]);

  useEffect(() => {
    // Fetch top communities
    fetch("/api/communities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTrending(data.slice(0, 8));
      })
      .catch(() => {});

    if (session?.user) {
      fetch("/api/communities?filter=joined")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setJoined(data);
        })
        .catch(() => {});
    }
  }, [session, pathname]);

  return (
    <aside className="w-64 shrink-0 hidden lg:block space-y-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pr-2 pb-6">
      {/* Navigation Card */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-3 shadow-sm">
        <nav className="space-y-1">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              pathname === "/"
                ? "bg-brand/15 text-brand"
                : "text-zinc-300 hover:bg-[#272729] hover:text-white"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home Feed</span>
          </Link>

          <button
            onClick={onOpenCreateCommunity}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-[#272729] hover:text-white transition-colors text-left"
          >
            <PlusCircle className="w-4 h-4 text-brand" />
            <span>Create Subverse</span>
          </button>
        </nav>
      </div>

      {/* My Subverses (if authenticated) */}
      {session?.user && joined.length > 0 && (
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-3 shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <Users className="w-3.5 h-3.5 text-brand" />
            <span>My Subverses</span>
          </div>

          <div className="space-y-0.5">
            {joined.map((subverse) => (
              <Link
                key={subverse.id}
                href={`/r/${subverse.name}`}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  pathname === `/r/${subverse.name}`
                    ? "bg-brand/10 text-brand font-semibold"
                    : "text-zinc-300 hover:bg-[#272729] hover:text-white"
                }`}
              >
                <span>r/{subverse.name}</span>
                <span className="text-[10px] text-zinc-500 font-normal">
                  {subverse.memberCount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular Subverses */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          <Compass className="w-3.5 h-3.5 text-brand" />
          <span>Popular Communities</span>
        </div>

        <div className="space-y-0.5">
          {trending.map((subverse, idx) => (
            <Link
              key={subverse.id}
              href={`/r/${subverse.name}`}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-[#272729] hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] font-bold text-zinc-500 w-4">
                  {idx + 1}
                </span>
                <span className="truncate">r/{subverse.name}</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-normal">
                {subverse.memberCount} members
              </span>
            </Link>
          ))}
          {trending.length === 0 && (
            <p className="text-xs text-zinc-500 px-3 py-2 italic">
              No subverses yet. Be the first to create one!
            </p>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 text-[11px] text-zinc-500 space-y-1">
        <p>© 2026 SubVerse Platform. All rights reserved.</p>
        <p>Built with Next.js 14, Tailwind & Prisma.</p>
      </div>
    </aside>
  );
}

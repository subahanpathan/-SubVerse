"use client";

import { formatKarma } from "@/lib/utils";
import {
  Flame,
  LogOut,
  Plus,
  PlusCircle,
  Search,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  onOpenAuth: (mode: "login" | "signup") => void;
  onOpenCreateCommunity: () => void;
  onOpenCreatePost: () => void;
}

export function Navbar({
  onOpenAuth,
  onOpenCreateCommunity,
  onOpenCreatePost,
}: NavbarProps) {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 bg-[#1A1A1B]/95 backdrop-blur border-b border-[#343536] px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-brand w-9 h-9 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Flame className="w-5.5 h-5.5 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1">
              Sub<span className="text-brand">Verse</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-medium -mt-1 tracking-wider uppercase">
              Community Hub
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search Subverses, posts, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#272729] text-sm text-white placeholder-zinc-400 pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-brand focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Quick Actions & Auth */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              {/* Create Post Button */}
              <button
                onClick={onOpenCreatePost}
                className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-3.5 py-2 rounded-full transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Post</span>
              </button>

              {/* Create Community Button */}
              <button
                onClick={onOpenCreateCommunity}
                className="hidden lg:flex items-center gap-1.5 bg-[#272729] hover:bg-[#343536] text-zinc-200 text-xs font-medium px-3 py-2 rounded-full border border-[#343536] transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-brand" />
                <span>Create Subverse</span>
              </button>

              {/* User Dropdown / Karma */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2.5 bg-[#272729] hover:bg-[#343536] p-1.5 pr-3 rounded-full border border-[#343536] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold text-xs border border-brand/30">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-[10px] text-brand font-medium flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      {formatKarma(session.user.karma || 0)} karma
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-[#1A1A1B] border border-[#343536] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#343536]">
                      <p className="text-xs font-semibold text-white">
                        {session.user.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {session.user.email}
                      </p>
                    </div>

                    <Link
                      href={`/user/${encodeURIComponent(session.user.name || session.user.id)}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-200 hover:bg-[#272729] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-zinc-400" />
                      Profile & Karma
                    </Link>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-[#272729] transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="text-xs font-semibold text-zinc-200 hover:text-white px-4 py-2 rounded-full hover:bg-[#272729] transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth("signup")}
                className="text-xs font-semibold bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-full transition-colors shadow-md"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

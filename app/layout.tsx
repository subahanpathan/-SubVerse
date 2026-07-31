"use client";

import { AuthModal } from "@/components/AuthModal";
import { CreateCommunityModal } from "@/components/CreateCommunityModal";
import { CreatePostModal } from "@/components/CreatePostModal";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { useState } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const handleOpenAuth = (mode: "login" | "signup" = "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <html lang="en" className="dark">
      <body className="bg-[#0D0D0E] text-zinc-100 antialiased selection:bg-brand selection:text-white">
        <Providers>
          <Navbar
            onOpenAuth={handleOpenAuth}
            onOpenCreateCommunity={() => setCreateCommunityOpen(true)}
            onOpenCreatePost={() => setCreatePostOpen(true)}
          />

          <main className="min-h-[calc(100vh-4rem)]">
            {/* Inject handlers into children via props or React Context if needed */}
            {children}
          </main>

          {/* Global Modals */}
          <AuthModal
            isOpen={authModalOpen}
            initialMode={authMode}
            onClose={() => setAuthModalOpen(false)}
          />

          <CreateCommunityModal
            isOpen={createCommunityOpen}
            onClose={() => setCreateCommunityOpen(false)}
          />

          <CreatePostModal
            isOpen={createPostOpen}
            onClose={() => setCreatePostOpen(false)}
          />
        </Providers>
      </body>
    </html>
  );
}

"use client";

import { AuthModal } from "@/components/AuthModal";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <AuthModal
        isOpen={true}
        initialMode="login"
        onClose={() => router.push("/")}
      />
    </div>
  );
}

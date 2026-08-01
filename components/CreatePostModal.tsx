"use client";

import { FileText, Image as ImageIcon, Link as LinkIcon, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CommunityItem {
  id: string;
  name: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  defaultCommunityName?: string;
  onClose: () => void;
}

export function CreatePostModal({
  isOpen,
  defaultCommunityName,
  onClose,
}: CreatePostModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [postType, setPostType] = useState<"text" | "image" | "link">("text");
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/communities")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCommunities(data);
            if (defaultCommunityName) {
              const matched = data.find(
                (c) => c.name.toLowerCase() === defaultCommunityName.toLowerCase()
              );
              if (matched) setSelectedCommunity(matched.id);
              else if (data.length > 0) setSelectedCommunity(data[0].id);
            } else if (data.length > 0) {
              setSelectedCommunity(data[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, defaultCommunityName]);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("Image size must be less than 4MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!selectedCommunity) {
        throw new Error("Please select a Subverse community");
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: postType === "text" ? content : undefined,
          imageUrl: postType === "image" ? imageUrl : undefined,
          linkUrl: postType === "link" ? linkUrl : undefined,
          communityId: selectedCommunity,
        }),
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Server returned error (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit post");
      }

      onClose();
      setTitle("");
      setContent("");
      setImageUrl("");
      setLinkUrl("");

      const matchedComm = communities.find((c) => c.id === selectedCommunity);
      if (matchedComm) {
        router.push(`/r/${matchedComm.name}/comments/${data.id}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#1A1A1B] border border-[#343536] w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-[#272729]"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-white mb-4">Create a Post</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Community Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Choose a Subverse
          </label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="w-full bg-[#272729] text-sm text-white px-3 py-2.5 rounded-xl border border-[#343536] focus:border-brand focus:outline-none"
          >
            <option value="" disabled>
              Select community...
            </option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                r/{c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Post Type Tabs */}
        <div className="flex border-b border-[#343536] mb-4">
          <button
            type="button"
            onClick={() => setPostType("text")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              postType === "text"
                ? "border-brand text-brand"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Text Post
          </button>
          <button
            type="button"
            onClick={() => setPostType("image")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              postType === "image"
                ? "border-brand text-brand"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image
          </button>
          <button
            type="button"
            onClick={() => setPostType("link")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              postType === "link"
                ? "border-brand text-brand"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              placeholder="Title"
              maxLength={300}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#272729] text-base font-semibold text-white placeholder-zinc-500 p-3 rounded-xl border border-[#343536] focus:border-brand focus:outline-none"
            />
          </div>

          {postType === "text" && (
            <div>
              <textarea
                rows={6}
                placeholder="Text (optional)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#272729] text-sm text-white placeholder-zinc-500 p-3 rounded-xl border border-[#343536] focus:border-brand focus:outline-none resize-none"
              />
            </div>
          )}

          {postType === "image" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Upload Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand/20 file:text-brand hover:file:bg-brand/30 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Or Image Web URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#272729] text-sm text-white placeholder-zinc-500 p-3 rounded-xl border border-[#343536] focus:border-brand focus:outline-none"
                />
              </div>

              {imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-[#343536] max-h-60 bg-black/40 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-56 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {postType === "link" && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Link URL
              </label>
              <input
                type="url"
                required
                placeholder="https://news.ycombinator.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full bg-[#272729] text-sm text-white placeholder-zinc-500 p-3 rounded-xl border border-[#343536] focus:border-brand focus:outline-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#343536]">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-400 hover:text-white px-4 py-2.5 rounded-full hover:bg-[#272729]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

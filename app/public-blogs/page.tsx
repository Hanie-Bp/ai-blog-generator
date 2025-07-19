"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Calendar, Loader2, User, X } from "lucide-react";
import { Select } from "@/components/ui/select";

type Blog = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  slug?: string;
  published?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name?: string;
    email?: string;
  };
};

function StarRating({
  value,
  onChange,
  editable = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  editable?: boolean;
}) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-xl ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          } ${editable ? "hover:text-yellow-500" : "cursor-default"}`}
          onClick={
            editable && onChange
              ? (e) => {
                  e.stopPropagation();
                  onChange(star);
                }
              : undefined
          }
          disabled={!editable}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function PublicBlogsPage() {
  const { data: session } = useSession();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalBlog, setModalBlog] = useState<Blog | null>(null);

  // Add state for ratings
  const [ratings, setRatings] = useState<
    Record<
      string,
      { average: number; count: number; userRating: number | null }
    >
  >({});

  const [sort, setSort] = useState("latest");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts?sort=${sort}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Blog[] = await response.json();
        setBlogs(data);
      } catch (err) {
        setError("Failed to fetch blogs.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [sort]);

  // Fetch ratings for all posts after blogs are loaded
  useEffect(() => {
    blogs.forEach((blog) => {
      fetch(`/api/posts/ratings?postId=${blog.id}`)
        .then((res) => res.json())
        .then((data) => setRatings((prev) => ({ ...prev, [blog.id]: data })));
    });
  }, [blogs]);

  // Handler to rate a post
  const handleRate = async (postId: string, value: number) => {
    console.log("handleRate", postId, value);

    if (!session) {
      alert("You must be signed in to rate posts.");
      return;
    }
    const res = await fetch("/api/posts/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, value }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to rate post.");
      return;
    }
    // Refresh rating
    fetch(`/api/posts/ratings?postId=${postId}`)
      .then((res) => res.json())
      .then((data) => setRatings((prev) => ({ ...prev, [postId]: data })));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Public Blogs</h1>
      <p className="text-lg text-gray-700 mb-6">
        Browse through a collection of public blogs.
      </p>
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="sort" className="font-medium">
          Sort by:
        </label>
        <Select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="latest">Latest</option>
          <option value="earliest">Earliest</option>
          <option value="highest-rated">Highest Rated</option>
        </Select>
      </div>
      {loading && <div className="text-center flex justify-center items-center py-10">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {!loading && !error && blogs.length === 0 && (
        <div className="text-center py-8">No blogs found.</div>
      )}
      {!loading && !error && blogs.length > 0 && (
        <div className="grid gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setModalBlog(blog)}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {blog.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-2 truncate">
                {stripHtml(blog.content).slice(0, 100)}
                {stripHtml(blog.content).length > 100 ? "..." : ""}
              </p>
              <div className="flex items-center text-xs text-gray-500 space-x-4 mb-2">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleDateString()
                    : new Date(blog.updatedAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <User className="mr-1 h-3 w-3" />
                  {blog.author?.name || blog.author?.email || "Unknown"}
                </span>
              </div>
              {/* Star rating UI for posts only */}
              <div className="flex items-center space-x-2 mt-2">
                <StarRating
                  value={ratings[blog.id]?.average || 0}
                  editable={false}
                />
                <span className="text-xs text-gray-500">
                  ({ratings[blog.id]?.count || 0})
                </span>
                {session && (
                  <span className="ml-4 flex items-center">
                    <span className="text-xs mr-1">Your rating:</span>
                    <StarRating
                      value={ratings[blog.id]?.userRating || 0}
                      onChange={(v) => handleRate(blog.id, v)}
                      editable={true}
                    />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full h-[70vh] p-6 relative flex flex-col">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setModalBlog(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 pr-8">{modalBlog.title}</h2>
            {/* Star rating UI for posts only */}
            <div className="flex items-center space-x-2 mb-4">
              <StarRating
                value={ratings[modalBlog.id]?.average || 0}
                editable={false}
              />
              <span className="text-xs text-gray-500">
                ({ratings[modalBlog.id]?.count || 0})
              </span>
              {session && (
                <span className="ml-4 flex items-center">
                  <span className="text-xs mr-1">Your rating:</span>
                  <StarRating
                    value={ratings[modalBlog.id]?.userRating || 0}
                    onChange={(v) => handleRate(modalBlog.id, v)}
                    editable={true}
                  />
                </span>
              )}
            </div>
            <div
              className="prose max-w-none flex-1 overflow-y-auto"
              style={{ minHeight: 0 }}
              dangerouslySetInnerHTML={{ __html: modalBlog.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

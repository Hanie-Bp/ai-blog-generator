"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import {
  PenTool,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  X,
} from "lucide-react";
import Link from "next/link";

interface Draft {
  id: string;
  title: string;
  content: string;
  topic?: string;
  tone: string;
  length: string;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  summary?: string;
  slug: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name?: string;
    email?: string;
  };
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Add StarRating component (copied from public-blogs/page.tsx)
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [modalDraft, setModalDraft] = useState<Draft | null>(null);
  const [modalPost, setModalPost] = useState<Post | null>(null);
  // Add state for ratings
  const [ratings, setRatings] = useState<
    Record<
      string,
      { average: number; count: number; userRating: number | null }
    >
  >({});

  useEffect(() => {
    if (status === "authenticated") {
      fetchDrafts();
      fetchPosts();
    }
  }, [status]);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts");
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const deleteDraft = async (id: string) => {
    try {
      const response = await fetch(`/api/drafts?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDrafts(drafts.filter((draft) => draft.id !== id));
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  };

  // Fetch ratings for all posts after posts are loaded
  useEffect(() => {
    posts.forEach((post) => {
      fetch(`/api/posts/ratings?postId=${post.id}`)
        .then((res) => res.json())
        .then((data) => setRatings((prev) => ({ ...prev, [post.id]: data })));
    });
  }, [posts]);

  // Handler to rate a post
  const handleRate = async (postId: string, value: number) => {
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

  const handlePublishDraft = async (draft: Draft) => {
    try {
      const slug = draft.title
        .trim()
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          content: draft.content,
          summary: draft.content.substring(0, 150),
          slug,
          published: true,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to publish draft");
        return;
      }
      // Refresh both drafts and posts to get up-to-date data
      await fetchDrafts();
      await fetchPosts();
      alert("Draft published and is now public!");
    } catch (error: any) {
      alert(error.message || "Failed to publish draft.");
    }
  };

  const handleUnpublishDraft = async (draft: Draft) => {
    try {
      // Find the corresponding post
      const post = posts.find(
        (p) => p.title === draft.title && p.content === draft.content
      );
      if (!post) {
        alert("No matching public post found.");
        return;
      }
      // Delete the post
      const response = await fetch(`/api/posts?id=${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to make private");
        return;
      }
      // Refresh both drafts and posts to get up-to-date data
      await fetchDrafts();
      await fetchPosts();
      alert("Post is now private (removed from public posts).");
    } catch (error: any) {
      alert(error.message || "Failed to make private.");
    }
  };

  return (
    <ProtectedRoute>
      {status === "authenticated" && (
        <div
          className={`min-h-screen bg-gray-50 ${
            modalDraft ? "blur-sm pointer-events-none select-none" : ""
          }`}
        >
          {/* Header */}
          <header className="border-b bg-white">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link
                    href="/"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <PenTool className="h-6 w-6" />
                    <span className="text-xl font-bold">AI Blog Generator</span>
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Link href="/editor">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Post
                    </Button>
                  </Link>
                  <Link href="/drafts">
                    <Button variant="outline">My Drafts</Button>
                  </Link>
                  <Link href="/public-blogs">
                    <Button variant="outline">Public Blogs</Button>
                  </Link>
                  <UserMenu />
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {session?.user?.name || session?.user?.email}!
              </h1>
              <p className="text-gray-600">
                Manage your blog posts and drafts from your personal dashboard.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Drafts Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                    Your Drafts
                  </CardTitle>
                  <CardDescription>
                    Continue working on your unfinished blog posts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Merge drafts and all posts authored by the user (published and unpublished)
                    const userEmail = session?.user?.email;
                    const userPosts = posts.filter(
                      (post) => post.author.email === userEmail
                    );
                    // Merge drafts and userPosts, avoiding duplicates (by title+content)
                    const mergedDrafts: (Draft | Post)[] = [
                      ...drafts,
                      ...userPosts.filter(
                        (post) =>
                          !drafts.some(
                            (d) =>
                              d.title === post.title &&
                              d.content === post.content
                          )
                      ),
                    ];
                    if (mergedDrafts.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">No drafts yet</p>
                          <Link href="/editor">
                            <Button>
                              <Plus className="mr-2 h-4 w-4" />
                              Create Your First Draft
                            </Button>
                          </Link>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-4">
                        {mergedDrafts.map((draft) => (
                          <div
                            key={draft.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => setModalDraft(draft as Draft)}
                              >
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {draft.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2 truncate">
                                  {stripHtml(draft.content).slice(0, 100)}
                                  {stripHtml(draft.content).length > 100
                                    ? "..."
                                    : ""}
                                </p>
                                <div className="flex items-center text-xs text-gray-500 space-x-4">
                                  <span className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(
                                      draft.updatedAt
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="capitalize">
                                    {"tone" in draft ? draft.tone : "n/a"}
                                  </span>
                                  <span className="capitalize">
                                    {"length" in draft ? draft.length : "n/a"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setModalDraft(draft as Draft)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Link href={`/editor?id=${draft.id}`}>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteDraft(draft.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {/* Toggle to make draft public/private */}
                                {posts.some(
                                  (post) =>
                                    post.title === draft.title &&
                                    post.content === draft.content
                                ) ? (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleUnpublishDraft(draft as Draft)
                                    }
                                  >
                                    Make Private
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handlePublishDraft(draft as Draft)
                                    }
                                  >
                                    Make Public
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Published Posts Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-green-600" />
                    Published Posts
                  </CardTitle>
                  <CardDescription>
                    Your published blog posts that are live on the web.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {posts.filter(
                    (post) =>
                      post.published &&
                      post.author.email === session?.user?.email
                  ).length === 0 ? (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        No published posts yet
                      </p>
                      <Link href="/editor">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Post
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts
                        .filter(
                          (post) =>
                            post.published &&
                            post.author.email === session?.user?.email
                        )
                        .map((post) => (
                          <div
                            key={post.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setModalPost(post)}
                          >
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 truncate">
                              {stripHtml(post.content).slice(0, 100)}
                              {stripHtml(post.content).length > 100
                                ? "..."
                                : ""}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 space-x-4 mb-2">
                              <span className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {post.publishedAt
                                  ? new Date(
                                      post.publishedAt
                                    ).toLocaleDateString()
                                  : new Date(
                                      post.createdAt
                                    ).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                {post.author.name || post.author.email}
                              </span>
                            </div>
                            {/* Star rating UI for posts only */}
                            <div className="flex items-center space-x-2 mt-2">
                              <StarRating
                                value={ratings[post.id]?.average || 0}
                                editable={false}
                              />
                              <span className="text-xs text-gray-500">
                                ({ratings[post.id]?.count || 0})
                              </span>
                              {session && (
                                <span className="ml-4 flex items-center">
                                  <span className="text-xs mr-1">
                                    Your rating:
                                  </span>
                                  <StarRating
                                    value={ratings[post.id]?.userRating || 0}
                                    onChange={(v) => handleRate(post.id, v)}
                                    editable={true}
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
      {modalDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full h-[70vh] p-6 relative flex flex-col">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setModalDraft(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 pr-8">{modalDraft.title}</h2>
            <div
              className="prose max-w-none flex-1 overflow-y-auto"
              style={{ minHeight: 0 }}
              dangerouslySetInnerHTML={{ __html: modalDraft.content }}
            />
          </div>
        </div>
      )}
      {modalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full h-[70vh] p-6 relative flex flex-col">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setModalPost(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 pr-8">{modalPost.title}</h2>
            <div
              className="prose max-w-none flex-1 overflow-y-auto"
              style={{ minHeight: 0 }}
              dangerouslySetInnerHTML={{ __html: modalPost.content }}
            />
            {/* Star rating UI in modal */}
            <div className="flex items-center space-x-2 mt-4">
              <StarRating
                value={ratings[modalPost.id]?.average || 0}
                editable={false}
              />
              <span className="text-xs text-gray-500">
                ({ratings[modalPost.id]?.count || 0})
              </span>
              {session && (
                <span className="ml-4 flex items-center">
                  <span className="text-xs mr-1">Your rating:</span>
                  <StarRating
                    value={ratings[modalPost.id]?.userRating || 0}
                    onChange={(v) => handleRate(modalPost.id, v)}
                    editable={true}
                  />
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { FileText, Edit, Calendar, Eye, X } from "lucide-react";
import { Select } from "@/components/ui/select";

interface Draft {
  id: string;
  title: string;
  content: string;
  topic?: string;
  tone: string;
  length: string;
  createdAt: string;
  updatedAt: string;
  public: boolean;
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function DraftsPage() {
  const { status } = useSession();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalDraft, setModalDraft] = useState<Draft | null>(null);
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    if (status === "authenticated") {
      fetchDrafts();
    }
  }, [status, sort]);

  const fetchDrafts = async () => {
    try {
      const response = await fetch(`/api/drafts?sort=${sort}`);
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading drafts...</p>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading drafts...</p>
          </div>
        </div>
      ) : (
        <div
          className={`min-h-screen bg-gray-50 ${
            modalDraft ? "blur-sm pointer-events-none select-none" : ""
          }`}
        >
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Your Drafts
            </h1>
            <Card>
              <CardHeader>
                <CardTitle>Drafts</CardTitle>
                <CardDescription>
                  Continue working on your unfinished blog posts.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                  </Select>
                </div>
                {loading && <div className="text-center py-4">Loading...</div>}
                {!loading && drafts.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No drafts yet</p>
                    <Link href="/editor">
                      <Button>Create Your First Draft</Button>
                    </Link>
                  </div>
                )}
                {!loading && drafts.length > 0 && (
                  <div className="space-y-4">
                    {drafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setModalDraft(draft)}
                        >
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {draft.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 truncate">
                            {stripHtml(draft.content).slice(0, 100)}
                            {stripHtml(draft.content).length > 100 ? "..." : ""}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(draft.updatedAt).toLocaleDateString()}
                            </span>
                            <span className="capitalize">{draft.tone}</span>
                            <span className="capitalize">{draft.length}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setModalDraft(draft)}
                          >
                            <Eye className="h-4 w-4" /> View
                          </Button>
                          <Link href={`/editor?id=${draft.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" /> Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
    </ProtectedRoute>
  );
}

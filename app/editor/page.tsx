"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import {
  Sparkles,
  Download,
  Globe,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { generateBlogContent, BlogGenerationRequest } from "@/lib/openai";
import {
  htmlToMarkdown,
  downloadMarkdown,
  downloadText,
} from "@/lib/exportMarkdown";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function EditorPage() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("id");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<
    "professional" | "casual" | "academic" | "conversational"
  >("professional");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);

  useEffect(() => {
    if (draftId) {
      setLoadingDraft(true);
      fetch(`/api/drafts?id=${draftId}`, { credentials: "include" })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to load draft");
          return res.json();
        })
        .then((data) => {
          setTitle(data.title || "");
          setTopic(data.topic || "");
          setTone(data.tone || "professional");
          setLength(data.length || "medium");
          setContent(data.content || "");
        })
        .catch(() => {
          setAlert({ type: "error", message: "Failed to load draft." });
        })
        .finally(() => setLoadingDraft(false));
    }
  }, [draftId]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      setAlert({
        type: "error",
        message: "Please enter a blog title to generate content.",
      });
      return;
    }

    setIsGenerating(true);
    setAlert(null);

    try {
      const request: BlogGenerationRequest = {
        title: title.trim(),
        topic: topic.trim() || undefined,
        tone,
        length,
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      // Remove leading code block marker (```html or ```)
      let generated = data.content;
      generated = generated.replace(/^```[a-zA-Z]*\n?/, "");
      setContent(generated);

      // Check if this was fallback content (no API key or quota exceeded)
      const isFallback = data.isFallback || false;

      setAlert({
        type: isFallback ? "warning" : "success",
        message: isFallback
          ? "Blog content generated using fallback mode (OpenAI API not available). You can still edit and customize it!"
          : "Blog content generated successfully! You can now edit and customize it.",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      setAlert({
        type: "error",
        message:
          "Failed to generate content. Please check your OpenAI API key and try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!content.trim()) {
      setAlert({
        type: "warning",
        message:
          "No content to export. Please generate or write some content first.",
      });
      return;
    }

    setIsExporting(true);
    try {
      const markdown = htmlToMarkdown(content);
      const filename = title.trim()
        ? `${title
            .trim()
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase()}.md`
        : "blog-post.md";
      downloadMarkdown(markdown, filename);

      setAlert({
        type: "success",
        message: "Blog post exported as Markdown file successfully!",
      });
    } catch (error) {
      console.error("Error exporting content:", error);
      setAlert({
        type: "error",
        message: "Failed to export content. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      setAlert({
        type: "warning",
        message: "Title and content are required to publish.",
      });
      return;
    }
    setIsPublishing(true);
    try {
      const slug = title
        .trim()
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          summary: content.substring(0, 150),
          slug,
          published: true,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to publish post");
      }
      setAlert({
        type: "success",
        message: "Blog post published and is now public!",
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message || "Failed to publish post.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setAlert({
        type: "warning",
        message: "Title and content are required to save a draft.",
      });
      return;
    }
    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draftId || undefined,
          title,
          topic,
          tone,
          length,
          content,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save draft");
      }
      setAlert({
        type: "success",
        message: "Draft saved successfully!",
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message || "Failed to save draft.",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <Globe className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Alert */}
          {alert && (
            <Alert
              className={`mb-6 ${
                alert.type === "success"
                  ? "border-green-500 bg-green-50"
                  : alert.type === "error"
                  ? "border-red-500 bg-red-50"
                  : "border-yellow-500 bg-yellow-50"
              }`}
            >
              {alert.type === "success" && <CheckCircle className="h-4 w-4" />}
              {alert.type === "error" && <AlertCircle className="h-4 w-4" />}
              {alert.type === "warning" && <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}
          {loadingDraft ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading draft...</span>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Panel - Generation Form */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
                      Generate Blog Content
                    </CardTitle>
                    <CardDescription>
                      Enter your blog title and preferences to generate
                      AI-powered content. If OpenAI API is not available, we'll
                      use fallback content generation.
                      <br />
                      <span className="text-xs text-gray-500 mt-1 block">
                        💡 To use AI generation, get a new API key from{" "}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          className="underline"
                        >
                          OpenAI Platform
                        </a>
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blog Title *
                      </label>
                      <Input
                        placeholder="Enter your blog title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topic (Optional)
                      </label>
                      <Textarea
                        placeholder="Describe the topic or provide additional context..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tone
                      </label>
                      <Select
                        value={tone}
                        onChange={(e) => setTone(e.target.value as any)}
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="academic">Academic</option>
                        <option value="conversational">Conversational</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Length
                      </label>
                      <Select
                        value={length}
                        onChange={(e) => setLength(e.target.value as any)}
                      >
                        <option value="short">Short (800-1200 words)</option>
                        <option value="medium">Medium (1500-2000 words)</option>
                        <option value="long">Long (2500-3500 words)</option>
                      </Select>
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !title.trim()}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        disabled={isExporting || !content.trim()}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => {
                          setIsExporting(true);
                          try {
                            const markdown = htmlToMarkdown(content);
                            const filename = title.trim()
                              ? `${title
                                  .trim()
                                  .replace(/[^a-z0-9]/gi, "-")
                                  .toLowerCase()}.md`
                              : "blog-post.md";
                            downloadMarkdown(markdown, filename);
                            setAlert({
                              type: "success",
                              message:
                                "Blog post exported as Markdown file successfully!",
                            });
                          } catch (error) {
                            setAlert({
                              type: "error",
                              message:
                                "Failed to export content. Please try again.",
                            });
                          } finally {
                            setIsExporting(false);
                          }
                        }}
                      >
                        Export to Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setIsExporting(true);
                          try {
                            const filename = title.trim()
                              ? `${title
                                  .trim()
                                  .replace(/[^a-z0-9]/gi, "-")
                                  .toLowerCase()}.txt`
                              : "blog-post.txt";
                            downloadText(content, filename);
                            setAlert({
                              type: "success",
                              message:
                                "Blog post exported as Text file successfully!",
                            });
                          } catch (error) {
                            setAlert({
                              type: "error",
                              message:
                                "Failed to export content. Please try again.",
                            });
                          } finally {
                            setIsExporting(false);
                          }
                        }}
                      >
                        Export to Text
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing || !content.trim()}
                    className="w-full"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        Publish Blog
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Right Panel - Editor */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Blog Editor</CardTitle>
                    <CardDescription>
                      Edit and format your generated content with our rich text
                      editor.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Generated content will appear here. You can edit and customize it..."
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  Sparkles,
  Download,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  FileText,
  Users,
  Eye,
} from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                AI Blog Generator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/editor">
                <Button>
                  Start Writing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-yellow-500 mr-2" />
            <span className="text-lg font-medium text-gray-600">
              AI-Powered
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Professional
            <span className="text-blue-600 block">Blog Content</span>
            in Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your ideas into engaging blog posts with our AI-powered
            writing assistant. Generate, edit, and publish content with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/editor">
              <Button size="lg" className="text-lg px-8 py-3">
                <Zap className="mr-2 h-5 w-5" />
                Start Creating
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Create Amazing Content
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our comprehensive toolkit helps you write, edit, and publish
            professional blog posts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>AI-Powered Generation</CardTitle>
              <CardDescription>
                Generate high-quality blog content from just a title or topic
                using advanced AI technology.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <PenTool className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Rich Text Editor</CardTitle>
              <CardDescription>
                Edit and format your content with our powerful TipTap editor
                featuring advanced formatting options.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Export & Share</CardTitle>
              <CardDescription>
                Export your content as Markdown files or publish directly to
                your blog platform.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Publishing Ready</CardTitle>
              <CardDescription>
                One-click publishing to popular platforms or export for your own
                website.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Quality Assurance</CardTitle>
              <CardDescription>
                Built-in tools to ensure your content is professional, engaging,
                and SEO-friendly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Generate content in seconds and edit in real-time with our
                optimized performance.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* User Blog Posts Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Blog Posts
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage and view all your created blog posts and drafts in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>My Drafts</CardTitle>
              <CardDescription>
                View and edit your saved drafts. Continue working on your posts
                where you left off.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/drafts">
                <Button className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View Drafts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Published Posts</CardTitle>
              <CardDescription>
                See all your published blog posts and manage their visibility
                settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/public-blogs">
                <Button className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View Published
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <PenTool className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Create New</CardTitle>
              <CardDescription>
                Start writing a new blog post with our AI-powered editor and
                rich text formatting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/editor">
                <Button className="w-full">
                  <PenTool className="mr-2 h-4 w-4" />
                  Start Writing
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

    

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Your First Blog Post?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of writers who are already creating amazing content
              with AI assistance.
            </p>
            <Link href="/editor">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-3"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 AI Blog Generator. Built with Next.js and OpenAI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

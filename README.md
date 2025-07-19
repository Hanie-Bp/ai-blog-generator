# AI Blog Generator

[![Build Status](https://img.shields.io/github/actions/workflow/status/your-repo/ci.yml?branch=main)](https://github.com/your-repo/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **Create, edit, and publish professional blog posts with AI assistance. Built with Next.js, TypeScript, OpenAI, and a modern UI.**

---

## 📸 Screenshots

<!--
Add screenshots/gifs of your app here for visual impact.
Example:
![Dashboard Screenshot](./screenshots/dashboard.png)
-->

---

## ✨ Features

- **AI-Powered Content Generation:** Generate high-quality blog posts from a title or topic using OpenAI GPT-4.
- **Rich Text Editor:** Edit and format content with TipTap’s powerful editor.
- **User Authentication:** Secure login with Google OAuth (NextAuth.js).
- **Personal Dashboard:** Manage drafts and published posts in one place.
- **Export Options:** Download posts as Markdown or publish directly.
- **Customizable Generation:** Choose tone, length, and style.
- **Modern UI/UX:** Responsive, accessible, and beautiful interface.
- **Persistent Storage:** PostgreSQL + Prisma ORM for reliable data management.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Editor:** TipTap Rich Text Editor
- **AI Backend:** OpenAI GPT-4
- **Authentication:** NextAuth.js (Google OAuth)
- **Database:** PostgreSQL + Prisma ORM
- **UI Components:** shadcn/ui patterns
- **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- PostgreSQL database (local or managed)
- Google OAuth credentials

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-repo/ai-blog-generator.git
   cd ai-blog-generator
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**

   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local` and fill in your credentials (OpenAI, database, Google OAuth, etc.).

4. **Set up the database:**

   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage

- **Sign In:** Use Google OAuth to access your dashboard.
- **Create Content:** Use the editor to generate and customize blog posts.
- **Save Drafts:** Work is auto-saved; access drafts from your dashboard.
- **Export/Publish:** Download as Markdown or publish posts.

---

## 🔧 Configuration

- **OpenAI API:** Get your key from [OpenAI](https://platform.openai.com/api-keys) and add to `.env.local`.
- **Database:** Use PostgreSQL locally or a managed service (e.g., Supabase, Railway).
- **Google OAuth:** Set up credentials in Google Cloud Console and add to `.env.local`.

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions (Vercel, Railway, DigitalOcean, etc.).

---

## 🗺️ Roadmap

- [x] User authentication and dashboard
- [x] AI-powered content generation
- [x] Draft and post management
- [x] Markdown export


---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📝 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [OpenAI](https://openai.com/)
- [TipTap](https://tiptap.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide](https://lucide.dev/)

---

## 📞 Support

- Open an [issue](https://github.com/ai-blog-generator/issues)
- Join the discussion on GitHub

---

**Happy Blogging! 🚀**

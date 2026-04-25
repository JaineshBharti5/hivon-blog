# HivonBlog — Full-Stack Blogging Platform

> Built for Hivon Automations LLP internship assignment · Deadline: 28 April 2026

A modern blogging platform built with **Next.js 14**, **Supabase**, and **Groq AI** that automatically generates summaries for every post.

🔗🔗 **Live Demo:** `https://hivon-blog-oistwqv7q-jaineshbharti5s-projects.vercel.app`_  
📦 **GitHub:** `https://github.com/yourusername/hivon-blog` _(replace with your repo URL)_

---

## ✨ Features

- **Three user roles:** Viewer, Author, Admin with strict access control
- **AI-powered summaries** using Google Groq (llama-3.3-70b-versatile) (generated once on post creation)
- **Full CRUD** for blog posts with featured images
- **Comments system** for all logged-in users
- **Search & pagination** on the blog listing page
- **Admin dashboard** to manage users, posts, and comments
- **Row Level Security** enforced at the database level via Supabase RLS

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + Backend | Next.js 14 (App Router) |
| Authentication | Supabase Auth (email/password) |
| Database | Supabase (PostgreSQL) |
| AI Integration | Groq API (llama-3.3-70b-versatile) |
| Styling | Tailwind CSS |
| Version Control | Git + GitHub |
| Deployment | Vercel |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key (free)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/hivon-blog.git
cd hivon-blog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Paste and run the contents of `supabase/schema.sql`
4. Go to **Storage** → Create a bucket named `post-images` (set to public)

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Blog listing (search + pagination)
│   ├── layout.tsx                  # Root layout with Navbar
│   ├── not-found.tsx
│   ├── api/
│   │   ├── posts/route.ts          # GET (list) / POST (create + AI summary)
│   │   ├── posts/[id]/route.ts     # PATCH (edit) / DELETE
│   │   ├── comments/route.ts       # GET / POST comments
│   │   └── auth/register/route.ts  # User profile creation
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── blog/[id]/page.tsx          # Post detail with comments
│   ├── dashboard/
│   │   ├── page.tsx                # Author dashboard
│   │   ├── new/page.tsx            # Create post
│   │   └── edit/[id]/page.tsx      # Edit post
│   └── admin/page.tsx              # Admin panel
├── components/
│   ├── Navbar.tsx
│   ├── PostForm.tsx                # Shared create/edit form
│   ├── CommentSection.tsx
│   ├── DashboardPostsList.tsx
│   ├── AdminPanel.tsx
│   ├── SearchBar.tsx
│   └── EditPostButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   └── server.ts               # Server + service role clients
│   ├── gemini.ts                   # Groq AI integration
│   ├── types.ts                    # TypeScript interfaces
│   └── middleware.ts               # Auth + role guards
└── middleware.ts                   # Next.js middleware
```

---

## 🗄 Database Schema

```sql
-- Users (linked to Supabase Auth)
users (id, name, email, role, avatar_url, created_at, updated_at)

-- Posts with AI summary stored to avoid repeated API calls
posts (id, title, body, image_url, summary, author_id, published, created_at, updated_at)

-- Comments
comments (id, post_id, user_id, comment_text, created_at)
```

---

## 🚢 Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Click **Deploy**

Vercel auto-detects Next.js — no additional configuration needed.

---

## 🤖 AI Tool Used

**Claude (claude.ai / Anthropic)**

Claude was used as the primary AI coding assistant throughout this project. It helped with:
- Scaffolding the entire Next.js 14 App Router structure
- Writing Supabase RLS policies for role-based security
- Designing the Google Gemini integration with token-efficient prompts
- Generating TypeScript types and component logic
- Reviewing API route security (auth checks, role validation)

**Why Claude:** Claude excels at understanding complex multi-file architectural decisions and can reason about security implications (e.g., why the service role key should only be used server-side, and why AI summaries should be stored rather than regenerated).

---

## 📋 Feature Logic Explained

### Authentication Flow
1. User signs up → Supabase Auth creates a user in `auth.users`
2. `/api/auth/register` is called server-side (with service role key) to create a matching row in `public.users` with `name`, `email`, and `role`
3. On login, Supabase Auth sets a session cookie
4. `middleware.ts` intercepts protected routes (`/dashboard`, `/admin`) and redirects unauthenticated users to `/auth/login`

### Role-Based Access
- **Database level:** Supabase Row Level Security (RLS) policies prevent unauthorized reads/writes directly
- **API level:** Each API route checks `profile.role` before allowing operations
- **Middleware level:** `/admin` routes check the user's role and redirect non-admins
- **UI level:** Edit/delete buttons are conditionally rendered based on role

### Post Creation Logic
1. Author submits form → `POST /api/posts`
2. API verifies auth + role (`author` or `admin` only)
3. Calls `generatePostSummary()` from `lib/gemini.ts`
4. Inserts post into DB with the generated `summary` field
5. Client redirects to the new post's page

### AI Summary Generation Flow
```
New post submitted
    ↓
Extract plain text from HTML body (strip tags)
    ↓
Truncate to 2000 chars (token reduction)
    ↓
Send to Groq (llama-3.3-70b-versatile) with structured prompt
    ↓
Store summary in posts.summary column (ONCE)
    ↓
Display on listing page & post page without re-calling API
```

### Cost Optimization
- Summary is **generated once** on post creation, never on edit
- Body is **truncated to 2000 chars** before sending to Gemini (reduces tokens by ~80%)
- Used **Groq (llama-3.3-70b-versatile)** (fastest, cheapest, and has a generous free tier)
- Fallback: if Gemini fails, the first 200 words of plain text are used as a summary
- Summaries stored in DB mean **zero API cost** for all subsequent page views

### Bug Encountered & Fixed
**Problem:** After signup, the `public.users` insert was failing silently because the anon key doesn't have INSERT permission on `public.users` due to RLS.

**Fix:** Created a dedicated `/api/auth/register` API route that uses the `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to the client). The service role bypasses RLS, so the insert succeeds. This also ensures users can never self-assign the `admin` role — the API route hard-codes `admin` as an invalid signup role.

### Key Architectural Decisions
- **App Router over Pages Router:** Better Server Components support means less client-side JS, faster initial loads
- **RLS at DB layer:** Even if someone bypasses the API, they can't read/write unauthorized data directly from Supabase
- **Service role key server-side only:** Never exposed via `NEXT_PUBLIC_` prefix; only used in API routes
- **AI summary stored in DB:** Prevents repeated Groq API calls that would cost money and add latency on every page load

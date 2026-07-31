# SubVerse — Reddit Clone MVP

A production-ready full-stack Reddit Clone built with **Next.js 14**, **Tailwind CSS**, **Prisma ORM**, **NextAuth.js**, and **SQLite** (dev) / **PostgreSQL** (prod).

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm 8+

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Run database migration
npx prisma migrate dev --name init

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
subverse/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │   │   └── register/route.ts        # User registration
│   │   ├── communities/
│   │   │   ├── route.ts                 # List & create communities
│   │   │   └── [id]/
│   │   │       ├── join/route.ts        # Join subverse
│   │   │       └── leave/route.ts       # Leave subverse
│   │   ├── posts/
│   │   │   ├── route.ts                 # List & create posts
│   │   │   └── [id]/
│   │   │       ├── route.ts             # Get / delete post
│   │   │       ├── vote/route.ts        # Vote on post
│   │   │       └── comments/route.ts    # List & create comments
│   │   ├── comments/
│   │   │   └── [id]/vote/route.ts       # Vote on comment
│   │   └── users/[id]/route.ts          # User profile data
│   ├── r/[name]/
│   │   ├── page.tsx                     # Community feed page
│   │   └── comments/[id]/page.tsx       # Post detail + comments
│   ├── user/[username]/page.tsx         # User profile page
│   ├── layout.tsx                       # Root layout + modals
│   ├── page.tsx                         # Home feed
│   └── globals.css                      # Global dark theme
├── components/
│   ├── Navbar.tsx                       # Top navigation bar
│   ├── Sidebar.tsx                      # Community sidebar
│   ├── PostCard.tsx                     # Post preview card
│   ├── CommentItem.tsx                  # Comment with voting
│   ├── CommentFeed.tsx                  # Comment stream + input
│   ├── AuthModal.tsx                    # Login/Signup modal
│   ├── CreateCommunityModal.tsx         # New subverse modal
│   ├── CreatePostModal.tsx              # Post creation modal
│   └── Providers.tsx                    # Session provider
├── lib/
│   ├── prisma.ts                        # Prisma client singleton
│   ├── auth.ts                          # NextAuth config
│   ├── utils.ts                         # Helpers & XSS sanitizer
│   └── validators/
│       ├── auth.ts                      # Zod login/signup schemas
│       ├── community.ts                 # Zod community schema
│       └── post.ts                      # Zod post/comment schemas
├── prisma/
│   └── schema.prisma                    # Database schema
├── types/
│   └── next-auth.d.ts                   # Session type extensions
├── middleware.ts                        # Route protection
└── .env.example                         # Environment template
```

---

## 🌐 Features

| Feature | Status |
|---------|--------|
| ✅ User signup/login (Credentials + Google OAuth) | MVP |
| ✅ Session persistence with JWT | MVP |
| ✅ Create, browse, join/leave Subverses | MVP |
| ✅ Create posts (Text / Image / Link) | MVP |
| ✅ Home feed + per-community feed | MVP |
| ✅ Post voting (upvote/downvote toggle) | MVP |
| ✅ Comment voting | MVP |
| ✅ Flat comment threads | MVP |
| ✅ Karma score aggregation | MVP |
| ✅ User profile page | MVP |
| ✅ Optimistic UI vote updates | MVP |
| 🔮 Nested/threaded comments | Future |
| 🔮 Notifications | Future |
| 🔮 Real-time WebSocket updates | Future |
| 🔮 Bookmarks | Future |
| 🔮 Admin moderation tools | Future |

---

## 🔐 Environment Variables

```env
DATABASE_URL="file:./dev.db"                    # SQLite for dev
NEXTAUTH_SECRET="your_super_secret_key_here"    # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"            # Dev URL

# Optional Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 🗄️ Database Schema

Uses **Prisma ORM** with:
- `User` — auth, karma tracking
- `Community` — subverse metadata  
- `CommunityMember` — join/leave junction table
- `Post` — text, link, and image posts
- `Comment` — flat list (parentId reserved for threading)
- `Vote` — upvote/downvote with DB-level uniqueness constraints

---

## 🚢 Production Deployment

### Database (Supabase PostgreSQL)
1. Create project at [supabase.com](https://supabase.com)
2. Update `DATABASE_URL` in `.env` to Supabase connection string
3. Change `schema.prisma` provider from `sqlite` to `postgresql`
4. Run `npx prisma migrate deploy`

### Frontend (Vercel)
1. Push code to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Set environment variables in Vercel project settings
4. Deploy!

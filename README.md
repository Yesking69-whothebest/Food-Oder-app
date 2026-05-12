# FoodOrderApp App - Next.js + Supabase

A complete food ordering application built with Next.js 14 (App Router) and Supabase.

## Features

- **Authentication**: Email/password login with Supabase Auth
- **Menu Browsing**: Search and filter by category
- **Shopping Cart**: Local storage based cart with stock checking
- **Checkout**: Delivery form with bulk discount (15% off for 3+ items)
- **Order History**: View past orders with status tracking
- **Favorites**: Save favorite menu items
- **User Profile**: Update profile and change password
- **Admin Panel**: Manage menu items, users, and view reports
- **Reports**: Top selling items, best customers, recent orders with CSV export

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Supabase (Auth, Database, RLS)
- Lucide React (icons)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Project Settings > API
3. Copy the `Project URL` and `anon/public` key

### 2. Configure Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migration

1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `supabase_migration.sql`
3. Run the SQL

### 4. Set Up Auth Redirect

In Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `http://localhost:3000` (or your Vercel domain)
- Redirect URLs: Add `http://localhost:3000/auth/callback`

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Create Admin User

After signing up a user, manually update their role in Supabase:

```sql
update profiles set role = 'admin' where email = 'your-email@gmail.com';
```

## Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

## Images

Place your food images in `/public/images/` folder. The app uses placeholders for now.
Replace `[Image: filename]` placeholders with actual images.

## File Structure

```
food-order-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── dashboard/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── favorites/
│   │   ├── profile/
│   │   ├── change-password/
│   │   ├── order-success/
│   │   ├── admin/
│   │   │   ├── menu/
│   │   │   ├── users/
│   │   │   └── reports/
│   │   └── auth/callback/
│   ├── components/
│   │   └── Navbar.tsx
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── server.ts
│   │       └── middleware.ts
│   └── types/
│       └── index.ts
├── public/
│   └── images/
│       └── bg-placeholder.jpg
├── supabase_migration.sql
├── package.json
└── README.md
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | User login |
| Signup | `/signup` | Create account |
| Dashboard | `/dashboard` | Browse menu, search, filter |
| Cart | `/cart` | View and manage cart |
| Checkout | `/checkout` | Place order |
| Order Success | `/order-success` | Order confirmation |
| Orders | `/orders` | Order history |
| Favorites | `/favorites` | Saved items |
| Profile | `/profile` | Edit profile |
| Change Password | `/change-password` | Update password |
| Admin Menu | `/admin/menu` | CRUD menu items |
| Admin Users | `/admin/users` | Manage users |
| Admin Reports | `/admin/reports` | Sales reports |

# Tomobile 360 - Marketplace Automobile au Maroc

A complete, production-ready automotive marketplace platform built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features Completed

### ✅ Phase 1: Foundation & Project Setup
- Next.js 14 with App Router and TypeScript
- Tailwind CSS with custom Tomobile 360 brand colors
- Supabase integration (database, auth, storage)
- Complete database schema with 13 tables
- Row Level Security (RLS) policies
- Responsive Header and Footer components

### ✅ Phase 2: Authentication System
- **Login Page** (`/login`) - Email/password authentication
- **Signup Page** (`/signup`) - User registration with profile creation
- **Forgot Password** (`/forgot-password`) - Password reset via email
- **Protected Routes** - Middleware guards for `/compte`, `/admin`, `/occasion/vendre`
- **User Menu** - Dynamic header showing user account dropdown when logged in
- Automatic profile creation on signup

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form + Zod validation
- **State**: React hooks + Supabase realtime

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The complete SQL schema is in `supabase-schema.sql`. It includes:

- **Tables**: brands, models, vehicles_new, vehicles_used, dealerships, promotions, comparisons, forum_categories, forum_topics, forum_posts, articles, videos, favorites, profiles
- **RLS Policies**: Public read, user CRUD, admin full access
- **Functions**: View counters, updated_at triggers
- **Seed Data**: 20 brands, 5 forum categories

## 🎨 Brand Colors

- **Primary** (#4A4A4A): Main dark gray from "Tomobile"
- **Accent** (#00A3E0): Bright blue from "360"
- **Success** (#10B981): Green
- **Warning** (#F59E0B): Orange
- **Error** (#EF4444): Red

## 📱 Pages Available

### Authentication
- `/login` - User login
- `/signup` - User registration
- `/forgot-password` - Password reset

### Public (To be implemented)
- `/` - Homepage
- `/neuf` - New vehicles browse
- `/occasion` - Used vehicles browse
- `/forum` - Community forum
- `/videos` - Video gallery
- `/actu` - News/blog

### Protected (To be implemented)
- `/compte` - User dashboard
- `/compte/mes-annonces` - My listings
- `/compte/favoris` - My favorites
- `/admin` - Admin panel

## 🔐 Testing Authentication

1. **Create an account**: Go to `/signup`
   - Fill in name, email, password
   - Optionally add phone and city
   - Accept terms and create account

2. **Check email**: Supabase sends confirmation email
   - For dev: Check Supabase Dashboard > Auth > Users

3. **Login**: Go to `/login`
   - Use your email and password
   - You'll be redirected to homepage
   - Header will show "Mon Compte" dropdown

4. **User Menu**: Click "Mon Compte" in header
   - Tableau de bord
   - Mes annonces
   - Mes favoris
   - Déconnexion

## 📝 Next Steps

### Phase 3: Homepage (In Progress)
- Hero section with search
- Promotions carousel
- New releases section
- Popular vehicles section
- Latest news and videos
- Partner brands

### Phase 4-7: Remaining Features
- New vehicles section with filters
- Used vehicles with posting
- User dashboard
- Forum, videos, news
- Admin panel

## 🤝 Contributing

This is a custom project. Contact the development team for contribution guidelines.

## 📄 License

Proprietary - All rights reserved to Tomobile 360

---

Built with ❤️ by the Tomobile 360 team

# CLAUDE.md — Tomobile 360

Comprehensive reference for AI agents working autonomously on this codebase.

---

## 1. Project Overview

**Tomobile 360** is a Moroccan automotive marketplace and media platform. It serves both consumers and dealerships, providing:

- A catalog of **new vehicles** with full specs and media
- A **user-posted used car listings** marketplace
- **Articles/news** about the Moroccan and international auto market
- A **YouTube-integrated video** gallery
- A **community forum** for car discussions
- An **admin panel** for managing all content
- Integration with external platforms: **M-Occaz** (Moroccan used car site, scraped) and **Vroom.be** (Belgian used cars, scraped for enriching new vehicle data)
- Tools for importing vehicle data from CSV and syncing videos from a YouTube channel

The target audience is Moroccan car buyers, sellers, and enthusiasts. The site is in **French**.

---

## 2. Tech Stack

### Core Framework
| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.18 |
| Language | TypeScript | 5 |
| Runtime | Node.js | — |
| UI | React | 18.3.1 |

### Styling
| Tool | Purpose |
|---|---|
| Tailwind CSS | Primary styling framework |
| tailwindcss-animate | Animation utilities |
| class-variance-authority (CVA) | Component variant management |
| clsx + tailwind-merge | Conditional classname merging |

### UI Components
| Library | Usage |
|---|---|
| Radix UI | Headless accessible primitives (Dialog, DropdownMenu, Label, Slot, Toast) |
| Lucide React | Icon set |
| Custom Shadcn-style wrappers | `src/components/ui/` |

### Backend / Database
| Tool | Purpose |
|---|---|
| Supabase | PostgreSQL DB, auth, storage, RLS |
| @supabase/supabase-js | JS client |
| @supabase/ssr | SSR-compatible session handling |

### Data Processing
| Tool | Purpose |
|---|---|
| Cheerio | HTML scraping (M-Occaz, Vroom.be) |
| tsx | TypeScript script execution |

### External APIs
- **YouTube Data API v3** — channel sync, video metadata
- **M-Occaz** — web-scraped Moroccan used car listings
- **Vroom.be** — web-scraped vehicle data for enrichment

---

## 3. Folder Structure

```
tomobile360/
├── src/
│   ├── app/                          # Next.js App Router pages + API
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── admin/                    # Admin dashboard (requires is_admin = true)
│   │   │   ├── page.tsx              # Admin home
│   │   │   ├── content/              # Article CRUD
│   │   │   ├── promotions/           # Promotions CRUD
│   │   │   ├── vehicles/             # New vehicles CRUD
│   │   │   ├── import-cars/          # CSV bulk import UI
│   │   │   ├── sync-videos/          # YouTube sync UI
│   │   │   └── users/                # User management
│   │   ├── api/                      # API route handlers
│   │   │   ├── moccaz/route.ts       # GET: scrape M-Occaz listings
│   │   │   ├── search/moccaz/route.ts# GET: search M-Occaz
│   │   │   └── revalidate/           # POST: ISR revalidation trigger
│   │   ├── occasion/                 # Used vehicles
│   │   │   └── page.tsx              # Listings with filters
│   │   ├── neuf/                     # New vehicles
│   │   │   ├── page.tsx              # Catalog
│   │   │   └── [brand]/[model]/[id]/ # Vehicle detail page
│   │   ├── actu/                     # Articles/news
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── compte/                   # User dashboard (auth required)
│   │   │   ├── page.tsx
│   │   │   ├── profil/page.tsx
│   │   │   ├── mes-annonces/page.tsx
│   │   │   └── favoris/page.tsx
│   │   ├── forum/                    # Community forum
│   │   │   └── [categoryId]/[topicId]/
│   │   ├── videos/page.tsx           # Video gallery
│   │   ├── services/                 # Service landing pages
│   │   ├── contact/page.tsx
│   │   ├── conditions/page.tsx
│   │   ├── confidentialite/page.tsx
│   │   ├── cookies/page.tsx
│   │   ├── mentions-legales/page.tsx
│   │   ├── actions/                  # Next.js Server Actions
│   │   │   ├── auth.ts               # login, signup, logout, resetPassword
│   │   │   ├── import-cars.ts        # CSV vehicle import
│   │   │   └── sync-youtube.ts       # YouTube channel sync
│   │   ├── page.tsx                  # Homepage
│   │   ├── layout.tsx                # Root layout (fonts, header, footer)
│   │   ├── globals.css               # Global CSS + Tailwind base
│   │   └── error.tsx                 # Error boundary
│   │
│   ├── components/                   # React components
│   │   ├── admin/                    # Admin-only UI components
│   │   │   ├── AdminAuthGate.tsx     # Client-side admin guard
│   │   │   ├── AdminSidebar.tsx      # Admin navigation
│   │   │   ├── ArticleForm.tsx       # Create/edit article
│   │   │   ├── PromotionForm.tsx     # Create/edit promotion
│   │   │   ├── VehicleForm.tsx       # Create/edit new vehicle
│   │   │   └── *Actions.tsx          # Delete/toggle actions
│   │   ├── home/                     # Homepage section components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── OccasionServicesSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── VideoSection.tsx
│   │   │   ├── NewsSection.tsx
│   │   │   ├── PromoBanner.tsx
│   │   │   └── BrandCarousel.tsx
│   │   ├── vehicles/                 # Vehicle display components
│   │   │   ├── VehicleCard.tsx       # Card for new vehicle listings
│   │   │   ├── UsedListingCard.tsx   # Card for used listings
│   │   │   ├── VehicleFilters.tsx    # Filter sidebar/panel
│   │   │   ├── VehicleSpecs.tsx      # Tech specs display
│   │   │   ├── ImageGallery.tsx      # Full-screen image carousel
│   │   │   ├── ComparisonTable.tsx   # Side-by-side comparison
│   │   │   └── VehicleSelector.tsx   # Brand/model selector dropdown
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Top nav, mobile menu, user dropdown
│   │   │   └── Footer.tsx
│   │   ├── forum/
│   │   │   ├── TopicActions.tsx      # Edit/delete topic
│   │   │   ├── PostActions.tsx       # Edit/delete post
│   │   │   └── ReplyForm.tsx         # Reply input
│   │   ├── shared/                   # Reusable cross-feature components
│   │   │   ├── FloatingSocialBubble.tsx
│   │   │   ├── ContactDealerDialog.tsx
│   │   │   ├── TestDriveDialog.tsx
│   │   │   ├── FavoriteButton.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   ├── BrandCarousel.tsx
│   │   │   └── LinkifyText.tsx
│   │   ├── videos/
│   │   │   ├── VideoLikeButton.tsx
│   │   │   └── VideoShareButton.tsx
│   │   └── ui/                       # Base UI primitives (Shadcn-style)
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── badge.tsx
│   │       └── label.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # createBrowserClient (browser)
│   │   │   ├── server.ts             # createServerClient (RSC / Server Actions)
│   │   │   └── middleware.ts         # updateSession for middleware
│   │   ├── actions/                  # Server-side data helpers
│   │   │   ├── admin.ts              # Full CRUD: articles, promotions, vehicles, users
│   │   │   ├── favorites.ts          # addFavorite, removeFavorite, getUserFavorites
│   │   │   ├── forum.ts              # Topics and posts CRUD
│   │   │   ├── listings.ts           # Used vehicle listings operations
│   │   │   └── vehicles.ts           # Vehicle search, filters, comparison
│   │   ├── scrapers/
│   │   │   └── moccaz.ts             # Cheerio scraper for m-occaz.ma
│   │   ├── types.ts                  # All TypeScript database types
│   │   ├── car-importer.ts           # CSV import logic with brand/model creation
│   │   ├── youtube.ts                # YouTube API: fetch, parse, categorize videos
│   │   └── utils.ts                  # cn(), formatPrice(), formatDate(), formatRelativeTime()
│   │
│   └── hooks/
│       └── use-toast.ts              # Toast notification hook (Radix-based)
│
├── migrations/                       # SQL migration files (run in Supabase SQL editor)
│   ├── supabase-schema.sql           # MASTER schema — run first
│   ├── add-youtube-videos.sql
│   ├── add-video-likes.sql
│   ├── add-vroom-fields.sql
│   ├── fix-rls-policies.sql
│   └── ... (11 more incremental fixes)
│
├── scripts/                          # One-off Node.js/TS data scripts
│   ├── import-cars.mjs               # Bulk import from CSV
│   ├── import-articles.mjs
│   ├── sync-brands.mjs
│   ├── vroom-scraper.js              # Vroom.be vehicle scraper
│   ├── image-reorder-server.mjs
│   ├── generate-image-preview.mjs
│   ├── resync-images.mjs
│   ├── fix-categories.mjs
│   └── test-moccaz.ts                # Test M-Occaz scraper (npm run test:moccaz)
│
├── public/
│   ├── articles/                     # Article featured images
│   ├── vehicles/                     # New vehicle images
│   ├── brands/                       # Brand SVG/PNG logos
│   ├── logo_tomobil360.png
│   └── *.png                         # Partner logos (bp, moccaz, atlanta-sanad)
│
├── src/middleware.ts                  # Route protection — /admin, /compte, /occasion/vendre
├── next.config.js                    # Image domains, compression
├── tailwind.config.ts                # Brand colors, fonts, shadows, animations
├── tsconfig.json                     # Path alias: @/* → ./src/*
├── package.json
├── .env.local                        # NOT in git — see Section 7
├── IMPORT_CARS_GUIDE.md
├── YOUTUBE_SYNC_SETUP.md
└── VIDEOS_SETUP.md
```

---

## 4. Current State

### Done (Production-Ready)
- [x] Full new vehicle catalog (`/neuf`) with detail pages, specs, image gallery
- [x] Used vehicle listings (`/occasion`) with filters (brand, fuel, price, city)
- [x] Post used car listing form (`/occasion/vendre`, auth-protected)
- [x] User authentication (signup, login, logout, forgot/reset password via Supabase Auth)
- [x] User dashboard (`/compte`) — profile, my listings, favorites
- [x] Admin dashboard with full CRUD for: vehicles, articles, promotions, users
- [x] Admin CSV import tool (`/admin/import-cars`)
- [x] YouTube channel video sync (`/admin/sync-videos`)
- [x] Articles/news section (`/actu`) with slug-based detail pages
- [x] Video gallery (`/videos`)
- [x] Community forum with categories, topics, threaded replies
- [x] Vehicle comparison feature (`ComparisonTable`)
- [x] Favorites/wishlist system
- [x] M-Occaz scraper integration (`/api/moccaz`, `/api/search/moccaz`)
- [x] Promotions/banners system
- [x] Brand carousel on homepage
- [x] Contact/dealer inquiry dialogs
- [x] Test drive request dialog
- [x] ISR with `revalidate = 60` on catalog pages
- [x] Route-level auth middleware protecting `/compte`, `/admin`, `/occasion/vendre`
- [x] RLS on all 14 Supabase tables
- [x] View counters for vehicles (via SECURITY DEFINER functions)
- [x] Legal pages (conditions, confidentialité, cookies, mentions légales)
- [x] **Coups de Cœur feature** — DB columns (`is_coup_de_coeur`, `coup_de_coeur_category`) on `vehicles_new`, admin toggle in `VehicleActions.tsx`, dedicated page at `/coups-de-coeur`, `CoupDeCoeurCard` component, `CoupsDeCoeurSection` on homepage. Migration files: `add-coup-de-coeur.sql`, `rename-tout-terrain-to-offroad.sql`. 15 test vehicles seeded across 4 categories.
- [x] **Global UI polish** — all heading titles (`h1`/`h2`/`h3`) switched from `text-gray-900` to `text-slate-700` (dark navy blue) across 21 files; Actualités section bumped from 3 to 4 posts (query + grid); brand carousel arrow spacing increased.

### Pending / Incomplete
- [ ] Vehicle detail page `/neuf/[brand]/[model]/[id]` — has TODO comments, fiche technique rework needed

---

## 5. Supabase Tables & Data Models

All types are defined in `src/lib/types.ts`.

### `brands`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | auto |
| name | TEXT UNIQUE | e.g., "Renault" |
| logo_url | TEXT | path to `/brands/*.png` |
| created_at | TIMESTAMP | |

### `models`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| brand_id | UUID FK → brands | CASCADE |
| name | TEXT | e.g., "Clio" |
| category | TEXT | Enum: Citadine, Compacte, Berline, SUV, Monospace, Break, Coupé, Cabriolet, Pick-up, Utilitaire |
| created_at | TIMESTAMP | |

UNIQUE constraint: `(brand_id, name)`

### `vehicles_new`
New cars for sale. 45 columns.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| brand_id | UUID FK → brands | NOT NULL |
| model_id | UUID FK → models | NOT NULL |
| version | TEXT | e.g., "Sport Line" |
| year | INTEGER | NOT NULL |
| price_min | DECIMAL(12,2) | MAD |
| price_max | DECIMAL(12,2) | MAD |
| fuel_type | TEXT | Enum: Essence, Diesel, Hybrid, Electric, PHEV |
| transmission | TEXT | Enum: Manual, Automatic, CVT, DCT |
| engine_size | DECIMAL(3,1) | Liters |
| cylinders | INTEGER | |
| horsepower | INTEGER | HP |
| torque | INTEGER | Nm |
| acceleration | DECIMAL(4,2) | 0–100 km/h |
| top_speed | INTEGER | km/h |
| fuel_consumption_city | DECIMAL(4,2) | L/100km |
| fuel_consumption_highway | DECIMAL(4,2) | |
| fuel_consumption_combined | DECIMAL(4,2) | |
| co2_emissions | INTEGER | g/km |
| dimensions | JSONB | `{length, width, height, wheelbase}` in mm |
| cargo_capacity | INTEGER | Liters |
| seating_capacity | INTEGER | |
| features | JSONB | Array of strings |
| safety_features | JSONB | Array of strings |
| images | JSONB | Array of URL strings |
| is_available | BOOLEAN | Default true |
| is_popular | BOOLEAN | Default false |
| is_new_release | BOOLEAN | Default false |
| is_coming_soon | BOOLEAN | Default false |
| launch_date | DATE | |
| views | INTEGER | Default 0 |
| doors | INTEGER | Added via migration |
| warranty_months | INTEGER | |
| exterior_color | TEXT | |
| interior_color | TEXT | |
| euro_norm | TEXT | e.g., "Euro 6" |
| vat_deductible | BOOLEAN | |
| power_kw | INTEGER | kW equivalent |
| source_url | TEXT | Original scraped URL |
| mileage | INTEGER | For demo/import data |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | auto-updated via trigger |

**Indexes:** brand_id, model_id, is_available, is_popular, is_new_release, created_at DESC

### `vehicles_used`
User-posted used car listings.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → auth.users | CASCADE, NOT NULL |
| brand_id | UUID FK → brands | NOT NULL |
| model_id | UUID FK → models | NOT NULL |
| year | INTEGER | |
| mileage | INTEGER | km |
| price | DECIMAL(12,2) | MAD |
| fuel_type | TEXT | Enum same as vehicles_new |
| transmission | TEXT | Enum same as vehicles_new |
| color | TEXT | |
| condition | TEXT | Enum: Excellent, Très Bon, Bon, Acceptable |
| description | TEXT | NOT NULL |
| city | TEXT | NOT NULL |
| seller_type | TEXT | Enum: individual, professional |
| contact_phone | TEXT | NOT NULL |
| contact_email | TEXT | NOT NULL |
| images | JSONB | Array of URLs |
| is_featured | BOOLEAN | Admin-promoted |
| is_active | BOOLEAN | Visible to public |
| is_sold | BOOLEAN | |
| views | INTEGER | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | auto trigger |

### `profiles`
Extends `auth.users`. Created automatically on signup.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK FK → auth.users | CASCADE |
| full_name | TEXT | |
| avatar_url | TEXT | Supabase storage URL |
| phone | TEXT | |
| city | TEXT | |
| bio | TEXT | |
| is_dealer | BOOLEAN | Default false |
| is_admin | BOOLEAN | Default false — set manually in DB |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | auto trigger |

### `promotions`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| dealership_id | UUID FK → dealerships | nullable |
| vehicle_id | UUID FK → vehicles_new | NOT NULL |
| title | TEXT | |
| description | TEXT | |
| image_url | TEXT | |
| discount_amount | DECIMAL(12,2) | MAD |
| discount_percentage | DECIMAL(5,2) | |
| valid_from | DATE | |
| valid_until | DATE | |
| terms | TEXT | |
| is_active | BOOLEAN | |

### `articles`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| author_id | UUID FK → auth.users | ON DELETE SET NULL |
| title | TEXT | |
| slug | TEXT UNIQUE | URL-friendly identifier |
| content | TEXT | HTML or Markdown |
| excerpt | TEXT | Short preview |
| featured_image | TEXT | URL |
| category | TEXT | Enum: Morocco, International, Market, Review, News |
| tags | JSONB | Array of strings |
| is_published | BOOLEAN | |
| published_at | TIMESTAMP | |
| views | INTEGER | |

### `videos`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title | TEXT | |
| description | TEXT | |
| embed_url | TEXT NOT NULL | YouTube embed or watch URL |
| thumbnail_url | TEXT | YouTube thumbnail |
| category | TEXT | Enum: Review, Launch, Comparison, Tutorial, News |
| vehicle_id | UUID FK → vehicles_new | nullable |
| duration | TEXT | e.g., "12:34" |
| views | INTEGER | |

### `favorites`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → auth.users | |
| vehicle_type | TEXT | Enum: new, used |
| vehicle_id | UUID | Reference to either vehicles_new or vehicles_used |

UNIQUE constraint: `(user_id, vehicle_type, vehicle_id)`

### `forum_categories`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | TEXT UNIQUE | |
| description | TEXT | |
| icon | TEXT | Lucide icon name string |
| order_position | INTEGER | Sort order |

### `forum_topics`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| category_id | UUID FK → forum_categories | |
| user_id | UUID FK → auth.users | |
| title | TEXT | |
| content | TEXT | |
| is_pinned | BOOLEAN | |
| is_locked | BOOLEAN | |
| views | INTEGER | |

### `forum_posts`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| topic_id | UUID FK → forum_topics | |
| user_id | UUID FK → auth.users | |
| content | TEXT | |
| parent_id | UUID FK → forum_posts | Nested replies (self-referential) |

### `dealerships`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | TEXT | |
| brand_id | UUID FK → brands | |
| address | TEXT | |
| city | TEXT | |
| phone | TEXT | |
| email | TEXT | |
| website | TEXT | |
| latitude | DECIMAL(10,8) | |
| longitude | DECIMAL(11,8) | |

### `comparisons`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → auth.users | |
| name | TEXT | User-given comparison name |
| vehicle_ids | JSONB | Array of vehicle UUIDs |
| is_public | BOOLEAN | |

### Supabase Storage Buckets (must be created manually in dashboard)
| Bucket | Access |
|---|---|
| `vehicle-images` | Public |
| `listings-images` | Public |
| `user-avatars` | Public |
| `article-images` | Public |
| `brand-logos` | Public |

### DB Functions
- `update_updated_at_column()` — TRIGGER FUNCTION called before UPDATE on vehicles_new, vehicles_used, profiles, articles, forum_topics, forum_posts
- `increment_vehicle_views(vehicle_id UUID)` — SECURITY DEFINER, increments `views` on vehicles_new
- `increment_used_vehicle_views(vehicle_id UUID)` — SECURITY DEFINER, increments `views` on vehicles_used

---

## 6. Coding Conventions & Patterns

### File & Component Conventions
- All source in `src/` with path alias `@/` → `src/`
- **Server Components** by default — add `'use client'` only when needed
- `'use client'` components: forms with state, interactive widgets, auth-dependent UI
- Component filenames: PascalCase (`VehicleCard.tsx`)
- Page files: always named `page.tsx` inside route directories
- Server action files: lowercase (`auth.ts`, `listings.ts`)

### TypeScript
- All database types in `src/lib/types.ts` — always use these, never inline
- Type-safe Supabase queries using `.select()` with explicit columns
- Prefer `type` over `interface` (following existing codebase pattern)
- Avoid `as any` — existing codebase has some, do not add more
- Avoid `// @ts-ignore` — existing codebase has some in scrapers, do not spread

### Supabase Client Usage
```typescript
// Server Component or Server Action:
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Component:
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Admin operations (bypass RLS) — only in Server Actions:
import { createClient as createServiceClient } from '@supabase/supabase-js'
const supabase = createServiceClient(url, SUPABASE_SERVICE_ROLE_KEY)
```

### Data Fetching Patterns
- **Server Components**: use async/await with Supabase server client directly
- **Parallel fetching**: use `Promise.all([...])` for independent queries (see homepage)
- **ISR**: set `export const revalidate = 60` at the top of page files
- **No useEffect for data fetching** in server components — fetch in the component body
- Client-side mutations: Server Actions via `action={}` or `startTransition()`

### State Management
- No global state library (no Redux, Zustand, Context API for data)
- Local `useState` for form inputs, loading states, UI toggles
- Auth state: read from Supabase server client in Server Components; `supabase.auth.getUser()` in middleware
- Toast notifications: `useToast()` hook from `src/hooks/use-toast.ts`

### Styling Conventions
- Use Tailwind utility classes directly — no CSS modules
- Use `cn()` from `@/lib/utils` for conditional classes:
  ```typescript
  import { cn } from '@/lib/utils'
  className={cn('base-class', condition && 'conditional-class', className)}
  ```
- Brand colors: use semantic tokens (`primary`, `secondary`, `dark`) not raw hex
- Dark sections (header, footer, admin): use `bg-dark-800` or `bg-gradient-futuristic`
- Cards: `shadow-card` at rest, `shadow-card-hover` on hover
- Animations: use predefined animation classes (`animate-fade-in`, `animate-float`, etc.)
- Fonts: `font-sans` (Roboto) for body, `font-display` (Montserrat Alternates) for headings

### Server Actions Pattern
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'

export async function doSomething(data: FormData) {
  const supabase = await createClient()
  const { data: result, error } = await supabase.from('table').insert({...})
  if (error) return { success: false, error: error.message }
  return { success: true, data: result }
}
```

### Utility Functions (`src/lib/utils.ts`)
```typescript
cn(...classes)               // Merge Tailwind classes
formatPrice(price: number)   // "150 000 DH" format
formatDate(date: string)     // Localized date string
formatRelativeTime(date)     // "il y a 2 heures"
```

### Error Handling
- Server Actions: return `{ success: boolean, error?: string }` objects
- Pages: use `error.tsx` for route-level error boundaries
- No `try/catch` wrapping every Supabase call — check `error` from destructured response

---

## 7. Environment Variables

Create `.env.local` in the project root (never commit this file):

```bash
# Supabase — REQUIRED
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-public-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-secret-key]

# App URL — REQUIRED
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or production URL

# YouTube Data API v3 — REQUIRED for /admin/sync-videos
YOUTUBE_API_KEY=[YouTube-Data-API-v3-key]
```

**Notes:**
- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never prefix with `NEXT_PUBLIC_`
- `YOUTUBE_API_KEY` is server-only — used only in server actions and API routes
- The middleware and server-side code access env vars via `process.env.NEXT_PUBLIC_SUPABASE_URL!` (non-null assertion — ensure vars are set)

---

## 8. Performance Standards

### ISR (Incremental Static Regeneration)
- Catalog pages: `export const revalidate = 60` (1-minute cache)
- Homepage: fetches brands, vehicles, articles, videos in parallel via `Promise.all()`
- Vehicle detail pages: statically generated with revalidation

### Image Optimization
- Use Next.js `<Image>` component for all images (never `<img>`)
- Allowed external image domains (configured in `next.config.js`):
  - `**.supabase.co` — Supabase storage
  - `i.ytimg.com` — YouTube thumbnails
  - `cdn.vroomsupport.be`, `**.vroom.be` — Vroom scraped images
  - `**.b-cdn.net` — CDN
  - `cloud.car-cutter.com` — Vehicle image processor
  - `m-occaz.ma` — M-Occaz scraped images
  - `images.unsplash.com` — Placeholder images
- Compression enabled: `compress: true` in next.config.js

### Database Performance
- All frequently-filtered columns are indexed (see schema section)
- Use `.select('col1, col2')` not `.select('*')` for large tables
- View counters use SECURITY DEFINER functions (not direct client updates)

### M-Occaz API Cache
- `/api/moccaz` caches scraped results for 30 minutes (`next: { revalidate: 1800 }`)

### Bundle Size
- No large state management libraries
- Radix UI components are individually imported (not entire library)
- Lucide icons: import individually from `lucide-react`

---

## 9. Known Issues to Fix

### TypeScript Issues
- Multiple `as any` type assertions in page files — should be typed properly
- `// @ts-ignore` comments in `src/lib/scrapers/moccaz.ts` (Cheerio typing)
- Supabase joined query results (e.g., `vehicles_new.brands`) typed as `any` in some places — should use proper join types

### Unused Imports / Dead Code
- Multiple standalone scripts in `scripts/` are one-off tools not integrated into the app

### Structural Issues
- Some admin pages duplicate RLS bypass logic that could be centralized in `lib/actions/admin.ts`

### Incomplete Features (TODOs in code)
- `src/app/contact/page.tsx` — form submission not implemented
- `src/app/compte/profil/page.tsx` — avatar upload may be incomplete
- `src/app/neuf/[brand]/[model]/[id]/page.tsx` — has TODO comments
- `src/app/services/controle/page.tsx` — placeholder content
- `src/components/layout/Footer.tsx` — incomplete links

### Schema / Migration Notes
- 16 migration files suggest iterative schema fixes — if setting up fresh, run `supabase-schema.sql` first, then all others in order
- YouTube `embed_url` vs `video_url` field naming: `embed_url` is in the schema; some migration files may reference `video_url` — verify before running
- `videos` table has a `video_likes` concept in migrations but `Video` type in `types.ts` doesn't include it — check `add-video-likes.sql` and update type if needed

### Image Upload
- Used car listings (`PostListingForm.tsx`) — image upload to Supabase storage is either incomplete or relies on external URLs; storage buckets must be created manually in Supabase dashboard

---

## 10. Key Features Reference

### Vehicle Catalog (`/neuf`)
- Lists all `vehicles_new` where `is_available = true`
- Filters: brand, model, fuel type, transmission, price range, category
- Sort by: price, newest, popularity
- Detail page at `/neuf/[brand]/[model]/[id]` shows full specs, image gallery, comparison CTA, contact dealer/test drive dialogs
- `VehicleFilters.tsx` — client component for filter state
- `VehicleCard.tsx` — card component with favorite button
- `ImageGallery.tsx` — full-screen carousel

### Used Vehicle Marketplace (`/occasion`)
- Lists all `vehicles_used` where `is_active = true AND is_sold = false`
- Filters: brand, fuel type, city, price range, mileage, year
- `UsedListingCard.tsx` — card with contact info
- Post listing at `/occasion/vendre` (auth required) via `PostListingForm.tsx`

### M-Occaz Integration
- `GET /api/moccaz` — scrapes listings from m-occaz.ma using Cheerio
- `GET /api/search/moccaz?q=query` — search on m-occaz.ma
- Results are displayed alongside local listings or in a separate tab
- Cache: 30 minutes
- Test with: `npm run test:moccaz`

### Authentication
- Supabase Auth with email/password
- Routes: `/login`, `/signup`, `/forgot-password`
- Server Actions in `src/app/actions/auth.ts`: `login()`, `signup()`, `logout()`, `resetPassword()`, `updatePassword()`
- Protected routes enforced by `middleware.ts`
- Admin role: set `is_admin = true` in `profiles` table manually

### User Dashboard (`/compte`)
- Profile editing at `/compte/profil`
- My listings at `/compte/mes-annonces` — view/manage posted used cars
- Favorites at `/compte/favoris` — saved new and used vehicles

### Admin Panel (`/admin`)
- Accessible only to users with `profiles.is_admin = true`
- **Vehicles**: CRUD for `vehicles_new` via `VehicleForm.tsx`
- **Content**: CRUD for `articles` via `ArticleForm.tsx`
- **Promotions**: CRUD for `promotions` via `PromotionForm.tsx`
- **Users**: View and manage user profiles
- **Import Cars**: Upload CSV to bulk-import vehicles (`import-cars.ts` server action)
- **Sync Videos**: Trigger YouTube channel sync (`sync-youtube.ts` server action, requires `YOUTUBE_API_KEY`)

### Articles & News (`/actu`)
- Lists published articles (`is_published = true`)
- Detail page at `/actu/[slug]`
- Categories: Morocco, International, Market, Review, News
- `Article` type with tags (JSONB array)

### Video Gallery (`/videos`)
- Lists all videos from `videos` table
- Embedded YouTube players via `embed_url`
- Categories: Review, Launch, Comparison, Tutorial, News
- Like/share functionality via `VideoLikeButton.tsx`, `VideoShareButton.tsx`

### Forum (`/forum`)
- Categories listed at `/forum`
- Topics at `/forum/[categoryId]`
- Threaded replies at `/forum/[categoryId]/[topicId]`
- `forum_posts.parent_id` enables nested replies
- Authenticated users can create topics and posts; owners can edit/delete
- Admin can pin/lock topics (via direct DB or future admin UI)

### Promotions
- Active promotions fetched where `is_active = true AND valid_until >= NOW()`
- Shown in `PromoBanner.tsx` on homepage
- Linked to a specific `vehicle_id` in `vehicles_new`

### Favorites
- `FavoriteButton.tsx` — client component, requires auth
- `favorites` table with `vehicle_type: 'new' | 'used'`
- `lib/actions/favorites.ts`: `addFavorite()`, `removeFavorite()`, `getUserFavorites()`

### Vehicle Comparison
- `ComparisonTable.tsx` — side-by-side specs comparison
- `comparisons` table stores `vehicle_ids` JSONB array
- `lib/actions/vehicles.ts` — comparison CRUD helpers

### YouTube Sync
- `lib/youtube.ts` — fetches channel videos via YouTube Data API v3
- Auto-categorizes videos based on title keywords
- Upserts into `videos` table
- Triggered from `/admin/sync-videos`
- Setup documented in `YOUTUBE_SYNC_SETUP.md`

---

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint check
npm run test:moccaz  # Test M-Occaz scraper
```

For database setup: run SQL files in `migrations/` via Supabase SQL Editor, starting with `supabase-schema.sql`.

---

## 11. Workflow: ZorkFlow (Superpowers + GSD Hybrid)

You operate in two modes that you switch between automatically based on the task. **Superpowers** handles thinking (planning, analysis, architecture, debugging across files). **GSD** handles shipping (building, styling, implementing, executing known steps). Both frameworks are installed — use their skills together, not in isolation.

### Mode Detection

- If the task involves PLANNING, ANALYZING, DEBUGGING across files, ARCHITECTURE, or understanding how systems connect → engage **Superpowers Mode**
- If the task involves BUILDING, STYLING, IMPLEMENTING a specific component, fixing a specific bug, or executing a known step → engage **GSD Mode**
- If given a feature request without a plan → START in Superpowers, produce the plan, then ask before switching to GSD execution

### Superpowers Mode (Think)

Use Superpowers skills (`superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:systematic-debugging`, `superpowers:verification-before-completion`, `superpowers:requesting-code-review`).

- Read and analyze relevant files before proposing changes
- Map out dependencies and side effects
- Produce a numbered implementation plan
- Don't write code until the plan is approved
- When debugging: trace the issue across the full stack before patching

### GSD Mode (Ship)

Use GSD skills (`gsd:execute-phase`, `gsd:fast`, `gsd:quick`, `gsd:ui-phase`, `gsd:ui-review`, `gsd:verify-work`).

- One task at a time, verify before moving on
- Keep changes scoped and minimal
- Show the result after each step
- Don't redesign architecture mid-task — flag it and continue
- If you hit a problem that needs broad reasoning, STOP and say "switching to Superpowers mode" before continuing

### Shared Context: `ZORKFLOW.md`

All state lives in **`ZORKFLOW.md`** at the project root. This is the single bridge between Superpowers and GSD.

**At session start:**
1. Read `ZORKFLOW.md` to pick up where the last session left off (check the `Carry-Forward` section)
2. Set the `Current Mode` based on what's needed

**During the session:**
- Superpowers writes the numbered plan into the `Active Plan` section (with checkboxes)
- GSD checks off tasks as they're completed and logs changes in `Completed This Session`
- Mode switches and blockers are logged in their sections
- Non-obvious decisions go in `Decisions Made`

**At session end (MANDATORY):**
1. Move any unfinished plan items and important decisions to `Carry-Forward`
2. Clear out `Completed This Session`, `Blockers`, and `Decisions Made` (this work is done)
3. Update `Last updated` timestamp
4. If the active plan is fully complete, clear it and set mode to `IDLE`

This keeps the file small — only what the next session needs to know survives.

### Auto-Transition Rules

1. **After a Superpowers plan is approved** → write it to `ZORKFLOW.md` Active Plan with checkboxes, switch to GSD and execute step by step
2. **If GSD execution hits a cross-cutting issue** → log it in Blockers, switch to Superpowers
3. **After all GSD steps are done** → do a Superpowers review pass, then update `ZORKFLOW.md`
4. **Always announce which mode you're in** at the start of your response

### Skill Mapping Reference

| Phase | Use Superpowers Skill | Use GSD Skill |
|---|---|---|
| New feature request | `superpowers:brainstorming` → `superpowers:writing-plans` | — |
| Plan approved, ready to build | — | `gsd:execute-phase` or `gsd:quick` |
| Frontend/UI design needed | `superpowers:brainstorming` (for UX decisions) | `gsd:ui-phase` (for design spec) → `gsd:execute-phase` |
| Bug found | `superpowers:systematic-debugging` | `gsd:fast` (if fix is obvious) |
| Implementation done | `superpowers:verification-before-completion` | `gsd:verify-work` |
| Code review | `superpowers:requesting-code-review` | `gsd:ui-review` (for frontend) |
| Ship to PR | — | `gsd:ship` |

---

## 12. Code Quality Rules (Agents Must Follow)

- NEVER leave unused imports in any file
- NEVER leave dead code or commented-out code blocks
- NEVER use `as any` — always use proper TypeScript types
- NEVER use `// @ts-ignore` — fix the underlying type issue
- ALL components must have proper error handling
- ALL Supabase queries must use `.select('specific,columns')` never `.select('*')`
- ALL forms must have proper validation and submission handling
- Use `next/image` for ALL images — never raw `<img>` tags
- ALL pages must have proper loading and error states

---

## 13. Priority Task List for Agents

### High Priority
1. Vehicle detail page `/neuf/[brand]/[model]/[id]` — fiche technique rework

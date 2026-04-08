# Tomobile 360 — Marketplace Automobile au Maroc

Plateforme automobile complète pour le marche marocain : catalogue de vehicules neufs, annonces d'occasion, articles, videos, forum communautaire et services partenaires.

**Site en production** : [tomobile360.ma](https://tomobile360.ma)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | Radix UI, Lucide Icons |
| Database | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the schema already set up

### Installation

```bash
git clone https://github.com/Ben776ya/tomobile360.git
cd tomobile360
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
YOUTUBE_API_KEY=your_youtube_api_key
```

### Run

```bash
npm run dev       # Development server on localhost:3000
npm run build     # Production build
npm run lint      # ESLint check
```

## Features

### Catalogue Vehicules Neufs (`/neuf`)
- Browse par marque, modele, carburant, transmission, prix
- Fiches techniques detaillees avec galerie d'images
- Comparaison cote a cote
- 58 marques avec logos

### Vehicules d'Occasion (`/occasion`)
- Annonces utilisateurs avec filtres (ville, prix, kilometrage)
- Depot d'annonce avec upload d'images vers Supabase Storage
- Integration M-Occaz (scraping de listings externes)

### Articles & Actualites (`/actu`)
- Blog natif avec systeme d'administration complet
- Categories : Maroc, International, Marche, Review, News
- Upload d'images via l'admin

### Videos (`/videos`)
- Galerie de videos YouTube synchronisees
- Categories : Review, Lancement, Comparaison, Tutoriel, News
- Likes et partage

### Forum Communautaire (`/forum`)
- Categories, sujets, reponses imbriquees
- Moderation par les admins

### Services Partenaires (`/services`)
- **SOFAC** — Credit auto
- **Atlanta Sanad** — Assurance auto
- **DabaPneus** — Pneus et entretien
- **NARSA** — Securite routiere
- Controle technique
- Demande de test drive

### Coups de Coeur (`/coups-de-coeur`)
- Selection editoriale de vehicules par categorie

### Espace Utilisateur (`/compte`)
- Profil, annonces, favoris
- Authentification email/mot de passe via Supabase Auth

### Administration (`/admin`)
- CRUD vehicules, articles, promotions, utilisateurs
- Import CSV en masse
- Synchronisation YouTube
- Gestion des marques et modeles

## Project Structure

```
src/
  app/              # Pages et API routes (App Router)
  components/       # Composants React (admin, home, vehicles, shared, ui)
  lib/              # Supabase clients, server actions, types, utilitaires
  hooks/            # Custom React hooks
public/
  brands/           # Logos des 58 marques
  *.png             # Logos partenaires et assets statiques
```

## Database

PostgreSQL via Supabase avec 14 tables principales :
`brands`, `models`, `vehicles_new`, `vehicles_used`, `profiles`, `articles`, `videos`, `favorites`, `promotions`, `dealerships`, `comparisons`, `forum_categories`, `forum_topics`, `forum_posts`

Row Level Security (RLS) active sur toutes les tables. Images stockees dans Supabase Storage.

## License

Proprietary — All rights reserved to Tomobile 360

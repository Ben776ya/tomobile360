// Database Types for Tomobile 360

export type Brand = {
  id: string
  name: string
  logo_url: string | null
  description: string | null
  created_at: string | null
}

export type BrandWithCounts = Brand & {
  model_count: number
  vehicle_count: number
}

export type Model = {
  id: string
  brand_id: string | null
  name: string
  // DB stores a free-text category; `VehicleCategory` lists the known values
  // for reference but doesn't constrain reads (the union with `string` made
  // the literal type useless, so we store as plain `string | null`).
  category: string | null
  created_at: string | null
}

export type VehicleCategory =
  | 'Citadine'
  | 'Compacte'
  | 'Berline'
  | 'SUV'
  | 'Monospace'
  | 'Break'
  | 'Coupé'
  | 'Cabriolet'
  | 'Pick-up'
  | 'Utilitaire'

export type CoupDeCoeurCategory =
  | 'voiture'
  | 'suv'
  | 'pickup'
  | 'electrique'

export type FuelType = 'Essence' | 'Diesel' | 'Hybrid' | 'Electric' | 'PHEV'
export type Transmission = 'Manual' | 'Automatic' | 'CVT' | 'DCT'
export type Condition = 'Excellent' | 'Très Bon' | 'Bon' | 'Acceptable'
export type SellerType = 'individual' | 'professional'

export type Variant = {
  version: string | null
  price_min: number | null
  price_max: number | null
  horsepower: number | null
  // DB stores free-text values; the `FuelType` / `Transmission` literal unions
  // above document the known values but don't constrain reads.
  fuel_type: string | null
  transmission: string | null
}

export type VehicleNew = {
  id: string
  brand_id: string
  model_id: string
  version: string | null
  year: number
  price_min: number | null
  price_max: number | null
  fuel_type: string | null
  transmission: string | null
  engine_size: number | null
  cylinders: number | null
  horsepower: number | null
  torque: number | null
  acceleration: number | null
  top_speed: number | null
  fuel_consumption_city: number | null
  fuel_consumption_highway: number | null
  fuel_consumption_combined: number | null
  co2_emissions: number | null
  dimensions: Record<string, unknown> | null
  cargo_capacity: number | null
  seating_capacity: number | null
  features: string[] | null
  safety_features: string[] | null
  images: string[] | null
  is_available: boolean | null
  is_popular: boolean | null
  is_new_release: boolean | null
  is_coming_soon: boolean | null
  launch_date: string | null
  views: number | null
  created_at: string | null
  updated_at: string | null
  // New fields from vroom.be scraping
  doors: number | null
  warranty_months: number | null
  exterior_color: string | null
  interior_color: string | null
  euro_norm: string | null
  vat_deductible: boolean | null
  power_kw: number | null
  source_url: string | null
  mileage: number | null
  is_coup_de_coeur: boolean
  coup_de_coeur_category: string | null
  coup_de_coeur_reason: string | null
  is_featured_offer: boolean
  variant_list: Variant[] | null
  brands?: Brand
  models?: Model
}

export type VehicleUsed = {
  id: string
  user_id: string
  brand_id: string
  model_id: string
  year: number
  mileage: number
  price: number
  fuel_type: string | null
  transmission: string | null
  color: string | null
  condition: string | null
  description: string
  city: string
  seller_type: string | null
  contact_phone: string
  contact_email: string
  images: string[] | null
  is_featured: boolean | null
  is_active: boolean | null
  is_sold: boolean | null
  views: number | null
  created_at: string | null
  updated_at: string | null
  brands?: Brand
  models?: Model
  profiles?: Profile
}

export type Dealership = {
  id: string
  name: string
  brand_id: string | null
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  website: string | null
  latitude: number | null
  longitude: number | null
  created_at: string | null
}

export type Promotion = {
  id: string
  dealership_id: string | null
  vehicle_id: string
  title: string
  description: string | null
  image_url: string | null
  discount_amount: number | null
  discount_percentage: number | null
  valid_from: string
  valid_until: string
  terms: string | null
  is_active: boolean | null
  created_at: string | null
  vehicles_new?: VehicleNew
  dealerships?: Dealership
}

/**
 * Promotion + nested vehicle shape returned by the admin promotions select:
 *   .select(`*, vehicles_new:vehicle_id (id, brands:brand_id (name),
 *            models:model_id (name), images)`)
 *
 * Supabase returns the nested object or `null` (never `undefined`) for
 * to-one joins. Used by:
 *   - src/app/admin/promotions/page.tsx (list)
 *   - src/app/admin/promotions/[id]/edit/page.tsx (detail)
 */
export type PromotionWithVehicle = Promotion & {
  vehicles_new:
    | {
        id: string
        brands: { name: string } | null
        models: { name: string } | null
        images: string[] | null
      }
    | null
}

export type ForumCategory = {
  id: string
  name: string
  description: string | null
  icon: string | null
  order_position: number | null
  created_at: string | null
}

export type ForumTopic = {
  id: string
  category_id: string
  user_id: string
  title: string
  content: string
  is_pinned: boolean | null
  is_locked: boolean | null
  views: number | null
  created_at: string | null
  updated_at: string | null
  forum_categories?: ForumCategory
  profiles?: Profile
}

export type ForumPost = {
  id: string
  topic_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string | null
  updated_at: string | null
  profiles?: Profile
}

export type Article = {
  id: string
  author_id: string | null
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  // Free-text in DB; known values: morocco | international | market | review | news
  category: string | null
  tags: string[] | null
  is_published: boolean | null
  published_at: string | null
  views: number | null
  created_at: string | null
  updated_at: string | null
  profiles?: Profile
}

export type Video = {
  id: string
  title: string
  description: string | null
  embed_url: string
  thumbnail_url: string | null
  // Free-text in DB; known values: review | launch | comparison | tutorial | news
  category: string | null
  vehicle_id: string | null
  duration: string | null
  views: number | null
  created_at: string | null
  vehicles_new?: VehicleNew
}

export type Favorite = {
  id: string
  user_id: string
  vehicle_type: 'new' | 'used'
  vehicle_new_id: string | null
  vehicle_used_id: string | null
  created_at: string | null
}

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  city: string | null
  bio: string | null
  is_dealer: boolean | null
  is_admin: boolean | null
  created_at: string | null
  updated_at: string | null
}

export type Comparison = {
  id: string
  user_id: string
  name: string
  vehicle_ids: string[]
  is_public: boolean | null
  created_at: string | null
}

export type NarsaVideo = {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  duration: string | null
  order_position: number | null
  is_published: boolean | null
  created_at: string | null
  updated_at: string | null
}

export type FicheTechnique = {
  id: string
  model_id: string
  specs: Record<string, string>
  en_detail: Record<string, string[]>
  source_url: string | null
  created_at: string
  updated_at: string
  models?: Model & { brands?: Brand }
}

export type Magazine = {
  id: string
  issue_number: number
  issue_date: string | null
  dossier_title: string
  dossier_subtitle: string | null
  cover_url: string
  pdf_url: string
  tags: string[]
  order_position: number
  is_published: boolean
  created_at: string
  updated_at: string
}

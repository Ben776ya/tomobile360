// Database Types for Tomobile 360

export type Brand = {
  id: string
  name: string
  logo_url: string | null
  description: string | null
  created_at: string
}

export type Model = {
  id: string
  brand_id: string
  name: string
  category: VehicleCategory
  created_at: string
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

export type VehicleNew = {
  id: string
  brand_id: string
  model_id: string
  version: string | null
  year: number
  price_min: number | null
  price_max: number | null
  fuel_type: FuelType | null
  transmission: Transmission | null
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
  dimensions: Record<string, any> | null
  cargo_capacity: number | null
  seating_capacity: number | null
  features: string[] | null
  safety_features: string[] | null
  images: string[] | null
  is_available: boolean
  is_popular: boolean
  is_new_release: boolean
  is_coming_soon: boolean
  launch_date: string | null
  views: number
  created_at: string
  updated_at: string
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
  coup_de_coeur_category: CoupDeCoeurCategory | null
  coup_de_coeur_reason: string | null
  is_featured_offer: boolean
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
  fuel_type: FuelType | null
  transmission: Transmission | null
  color: string | null
  condition: Condition | null
  description: string
  city: string
  seller_type: SellerType | null
  contact_phone: string
  contact_email: string
  images: string[] | null
  is_featured: boolean
  is_active: boolean
  is_sold: boolean
  views: number
  created_at: string
  updated_at: string
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
  created_at: string
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
  is_active: boolean
  created_at: string
  vehicles_new?: VehicleNew
  dealerships?: Dealership
}

export type ForumCategory = {
  id: string
  name: string
  description: string | null
  icon: string | null
  order_position: number
  created_at: string
}

export type ForumTopic = {
  id: string
  category_id: string
  user_id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  views: number
  created_at: string
  updated_at: string
  forum_categories?: ForumCategory
  profiles?: Profile
}

export type ForumPost = {
  id: string
  topic_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
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
  category: 'morocco' | 'international' | 'market' | 'review' | 'news' | null
  tags: string[] | null
  is_published: boolean
  published_at: string | null
  views: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export type Video = {
  id: string
  title: string
  description: string | null
  embed_url: string
  thumbnail_url: string | null
  category: 'review' | 'launch' | 'comparison' | 'tutorial' | 'news' | null
  vehicle_id: string | null
  duration: string | null
  views: number
  created_at: string
  vehicles_new?: VehicleNew
}

export type Favorite = {
  id: string
  user_id: string
  vehicle_type: 'new' | 'used'
  vehicle_new_id: string | null
  vehicle_used_id: string | null
  created_at: string
}

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  city: string | null
  bio: string | null
  is_dealer: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type Comparison = {
  id: string
  user_id: string
  name: string
  vehicle_ids: string[]
  is_public: boolean
  created_at: string
}

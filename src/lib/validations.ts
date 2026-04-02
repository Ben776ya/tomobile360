import { z } from 'zod'

// === Article Schemas ===

export const ArticleSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(255, 'Titre trop long'),
  slug: z.string().min(1, 'Slug requis').max(255).regex(/^[a-z0-9-]+$/, 'Slug invalide (lettres minuscules, chiffres, tirets)'),
  excerpt: z.string().max(500, 'Résumé trop long').default(''),
  content: z.string().min(1, 'Contenu requis').max(500000, 'Contenu trop volumineux'),
  featured_image: z.string().nullable().optional(),
  category: z.string().min(1, 'Catégorie requise').refine(
    (val) => ['morocco', 'international', 'market', 'review', 'news'].includes(val),
    { message: 'Catégorie invalide' }
  ),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags').default([]),
  is_published: z.boolean(),
})

export type ArticleInput = z.infer<typeof ArticleSchema>

// === Admin Update Schemas ===

export const UpdateVideoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  embed_url: z.string().url().optional(),
  thumbnail_url: z.string().url().nullable().optional(),
  category: z.string().optional(),
  vehicle_id: z.string().uuid().nullable().optional(),
  duration: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
}).strict()

export const UpdateVehicleSchema = z.object({
  brand_id: z.string().uuid().optional(),
  model_id: z.string().uuid().optional(),
  version: z.string().nullable().optional(),
  year: z.number().int().optional(),
  price_min: z.number().nullable().optional(),
  price_max: z.number().nullable().optional(),
  fuel_type: z.string().nullable().optional(),
  transmission: z.string().nullable().optional(),
  engine_size: z.number().nullable().optional(),
  cylinders: z.number().int().nullable().optional(),
  horsepower: z.number().nullable().optional(),
  torque: z.number().nullable().optional(),
  acceleration: z.number().nullable().optional(),
  top_speed: z.number().nullable().optional(),
  fuel_consumption_city: z.number().nullable().optional(),
  fuel_consumption_highway: z.number().nullable().optional(),
  fuel_consumption_combined: z.number().nullable().optional(),
  co2_emissions: z.number().nullable().optional(),
  doors: z.number().int().nullable().optional(),
  seating_capacity: z.number().int().nullable().optional(),
  cargo_capacity: z.number().nullable().optional(),
  exterior_color: z.string().nullable().optional(),
  interior_color: z.string().nullable().optional(),
  warranty_months: z.number().int().nullable().optional(),
  euro_norm: z.string().nullable().optional(),
  mileage: z.number().nullable().optional(),
  features: z.array(z.string()).nullable().optional(),
  safety_features: z.array(z.string()).nullable().optional(),
  images: z.array(z.string()).nullable().optional(),
  dimensions: z.record(z.string(), z.number()).nullable().optional(),
  is_available: z.boolean().optional(),
  is_popular: z.boolean().optional(),
  is_new_release: z.boolean().optional(),
  is_coming_soon: z.boolean().optional(),
  is_featured_offer: z.boolean().optional(),
  coup_de_coeur_reason: z.string().nullable().optional(),
}).strict()

export const UpdatePromotionSchema = z.object({
  vehicle_id: z.string().uuid().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  discount_percentage: z.number().min(0).max(100).nullable().optional(),
  discount_amount: z.number().min(0).nullable().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
  terms: z.string().max(5000).nullable().optional(),
  is_active: z.boolean().optional(),
}).strict()

// === Brand Schemas ===

export const CreateBrandSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  logo_url: z.string().nullable().optional(),
  description: z.string().max(1000, 'Description trop longue').nullable().optional(),
})

export const UpdateBrandSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long').optional(),
  logo_url: z.string().nullable().optional(),
  description: z.string().max(1000, 'Description trop longue').nullable().optional(),
})

// === Model Schemas ===

const VehicleCategoryEnum = z.enum([
  'Citadine',
  'Compacte',
  'Berline',
  'SUV',
  'Monospace',
  'Break',
  'Coupé',
  'Cabriolet',
  'Pick-up',
  'Utilitaire',
])

export const CreateModelSchema = z.object({
  brand_id: z.string().uuid('brand_id doit être un UUID valide'),
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  category: VehicleCategoryEnum,
})

export const UpdateModelSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long').optional(),
  category: VehicleCategoryEnum.optional(),
})

// === Inferred Types ===

export type UpdateVideoInput = z.infer<typeof UpdateVideoSchema>
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>
export type UpdatePromotionInput = z.infer<typeof UpdatePromotionSchema>
export type CreateBrandInput = z.infer<typeof CreateBrandSchema>
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>
export type CreateModelInput = z.infer<typeof CreateModelSchema>
export type UpdateModelInput = z.infer<typeof UpdateModelSchema>

// === Validation Helper ===

export function validateAction<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; fieldErrors?: Record<string, string[]> } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    if (!fieldErrors[key]) fieldErrors[key] = []
    fieldErrors[key].push(issue.message)
  }
  const firstMessage = result.error.issues[0]?.message ?? 'Donnees invalides'
  return { success: false, error: firstMessage, fieldErrors }
}

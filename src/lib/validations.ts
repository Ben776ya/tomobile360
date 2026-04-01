import { z } from 'zod'

// === Auth Schemas ===

export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
})

export const SignupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres').max(100),
  phone: z.string().optional().default(''),
  city: z.string().optional().default(''),
})

export const ResetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

export const UpdatePasswordSchema = z.object({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
})

// === Forum Schemas ===

export const ForumTopicSchema = z.object({
  category_id: z.string().uuid('Categorie invalide'),
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caracteres').max(200, 'Le titre ne doit pas depasser 200 caracteres'),
  content: z.string().min(20, 'Le message doit contenir au moins 20 caracteres'),
})

export const ForumReplySchema = z.object({
  topic_id: z.string().uuid('Sujet invalide'),
  content: z.string().min(1, 'Le message ne peut pas etre vide').max(10000, 'Le message est trop long'),
})

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
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  discount_percentage: z.number().nullable().optional(),
  discount_amount: z.number().nullable().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
  terms: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
}).strict()

// === Inferred Types ===

export type UpdateVideoInput = z.infer<typeof UpdateVideoSchema>
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>
export type UpdatePromotionInput = z.infer<typeof UpdatePromotionSchema>

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

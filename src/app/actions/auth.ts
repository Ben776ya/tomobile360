'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validateAction, LoginSchema, SignupSchema, ResetPasswordSchema, UpdatePasswordSchema } from '@/lib/validations'

export async function login(formData: FormData) {
  const supabase = createClient()

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const validated = validateAction(LoginSchema, rawData)
  if (!validated.success) return { error: validated.error }

  const { error } = await supabase.auth.signInWithPassword(validated.data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('full_name') as string,
    phone: (formData.get('phone') as string) || '',
    city: (formData.get('city') as string) || '',
  }
  const validated = validateAction(SignupSchema, rawData)
  if (!validated.success) return { error: validated.error }

  const { data: authData, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        full_name: validated.data.full_name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile
  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: validated.data.full_name,
      phone: validated.data.phone || null,
      city: validated.data.city || null,
    })

    // profileError is non-fatal — user can still log in
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Vérifiez votre email pour confirmer votre compte')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = createClient()

  const rawData = { email: formData.get('email') as string }
  const validated = validateAction(ResetPasswordSchema, rawData)
  if (!validated.success) return { error: validated.error }

  const { error } = await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = createClient()

  const rawData = { password: formData.get('password') as string }
  const validated = validateAction(UpdatePasswordSchema, rawData)
  if (!validated.success) return { error: validated.error }

  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/compte')
}

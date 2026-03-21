"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function signUp(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/"

  const supabase = await createClient()

  const confirmUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`)
  confirmUrl.searchParams.set("next", redirectTo)

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: confirmUrl.toString(),
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Send welcome email (fire-and-forget — don't block sign-up on email failure)
  sendWelcomeEmail(email, name || email.split("@")[0]).catch(console.error)

  const signInUrl = new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL)
  signInUrl.searchParams.set("message", "Check your email to confirm your account")
  if (redirectTo !== "/") signInUrl.searchParams.set("redirectTo", redirectTo)
  redirect(signInUrl.pathname + signInUrl.search)
}

export async function signIn(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/"

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect(redirectTo)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/sign-in")
}

export async function forgotPassword(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const email = formData.get("email") as string
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/reset-password`,
  })

  if (error) return { error: error.message }

  return { success: true }
}

export async function resetPassword(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const password = formData.get("password") as string
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }

  redirect("/sign-in?message=Password updated. Sign in with your new password.")
}

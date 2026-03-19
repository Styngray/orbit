"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Send welcome email (fire-and-forget — don't block sign-up on email failure)
  sendWelcomeEmail(email, name || email.split("@")[0]).catch(console.error)

  redirect("/sign-in?message=Check your email to confirm your account")
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect("/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/sign-in")
}

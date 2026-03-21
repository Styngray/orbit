"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateProfile, updateAvatar, updateNotificationPrefs } from "@/lib/actions/profile"
import { createClient } from "@/lib/supabase/client"

interface ProfileFormProps {
  userId: string
  displayName: string
  email: string
  avatarUrl: string | null
  notifyMentions: boolean
  notifyAssignments: boolean
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileForm({
  userId,
  displayName,
  email,
  avatarUrl,
  notifyMentions,
  notifyAssignments,
}: ProfileFormProps) {
  const [name, setName] = useState(displayName)
  const [avatar, setAvatar] = useState(avatarUrl)
  const [savingName, setSavingName] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [mentions, setMentions] = useState(notifyMentions)
  const [assignments, setAssignments] = useState(notifyAssignments)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleNameSave() {
    setSavingName(true)
    const { error } = await updateProfile(name)
    setSavingName(false)
    if (error) toast.error(error)
    else toast.success("Display name updated")
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${userId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error("Failed to upload avatar")
      setUploadingAvatar(false)
      return
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    const { error } = await updateAvatar(data.publicUrl)
    setUploadingAvatar(false)

    if (error) toast.error(error)
    else {
      setAvatar(data.publicUrl)
      toast.success("Avatar updated")
    }
  }

  async function handleSavePrefs() {
    setSavingPrefs(true)
    const { error } = await updateNotificationPrefs(mentions, assignments)
    setSavingPrefs(false)
    if (error) toast.error(error)
    else toast.success("Preferences saved")
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
      </div>

      <div className="divide-y divide-border">
        {/* Avatar */}
        <div className="py-8">
          <h2 className="text-base font-medium mb-1">Avatar</h2>
          <p className="text-sm text-muted-foreground mb-4">Upload a profile picture.</p>
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-lg">
              <AvatarImage src={avatar ?? undefined} />
              <AvatarFallback className="rounded-lg text-sm">
                {getInitials(name || email)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingAvatar ? "Uploading…" : "Choose image"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Display name */}
        <div className="py-8">
          <h2 className="text-base font-medium mb-1">Display name</h2>
          <p className="text-sm text-muted-foreground mb-4">Your name visible to teammates.</p>
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={savingName}
              className="max-w-xs"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={savingName || !name.trim()}
              onClick={handleNameSave}
            >
              {savingName ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        {/* Email notifications */}
        <div className="py-8">
          <h2 className="text-base font-medium mb-1">Email notifications</h2>
          <p className="text-sm text-muted-foreground mb-4">Choose which emails you receive.</p>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={mentions}
                onCheckedChange={(v) => setMentions(!!v)}
              />
              <span className="text-sm">Mentions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={assignments}
                onCheckedChange={(v) => setAssignments(!!v)}
              />
              <span className="text-sm">Task assignments</span>
            </label>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={savingPrefs}
            onClick={handleSavePrefs}
          >
            {savingPrefs ? "Saving…" : "Save preferences"}
          </Button>
        </div>
      </div>
    </div>
  )
}

import { SettingsTabs } from "@/components/app/settings-tabs"

interface Props {
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}

export default async function SettingsLayout({ children, params }: Props) {
  const { workspaceId } = await params

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <SettingsTabs workspaceId={workspaceId} />
        {children}
      </div>
    </div>
  )
}

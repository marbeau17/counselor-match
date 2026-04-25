import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { hasSecretSetting, getPlainSetting } from "@/lib/secrets"
import { SettingsForm } from "./form"

export default async function AdminSettingsPage() {
  const [hasGeminiKey, geminiModel] = await Promise.all([
    hasSecretSetting("gemini.api_key"),
    getPlainSetting("gemini.image_model"),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">設定</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">外部 API キー / システム設定</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gemini Banana Pro (画像生成)</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            hasGeminiKey={hasGeminiKey}
            geminiModel={geminiModel ?? "gemini-3-pro-image-preview"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>設定の説明</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>API キーは <code className="px-1 bg-gray-100 dark:bg-gray-800 rounded">app_settings</code> テーブルに AES-256-GCM で暗号化保存されます。</p>
          <p>Vercel に <code className="px-1 bg-gray-100 dark:bg-gray-800 rounded">SETTINGS_ENCRYPTION_KEY</code> 環境変数 (32 bytes hex) が必要です。</p>
          <p>復号は service_role を持つサーバーサイドのみで実行されます。</p>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { initializeAdmin } from '@/api/credentials'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SetupPageProps {
  onInitialized: () => void
}

export function SetupPage({ onInitialized }: SetupPageProps) {
  const [adminKey, setAdminKey] = useState('')
  const [confirmAdminKey, setConfirmAdminKey] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adminKey.trim() !== confirmAdminKey.trim()) {
      toast.error('两次输入的管理员密钥不一致')
      return
    }
    setIsSubmitting(true)
    try {
      await initializeAdmin({
        adminApiKey: adminKey.trim(),
        apiKey: apiKey.trim() ? apiKey.trim() : undefined,
      })
      toast.success('初始化成功，请使用刚设置的密钥登录')
      setAdminKey('')
      setConfirmAdminKey('')
      setApiKey('')
      onInitialized()
    } catch (error) {
      const message =
        (error as any)?.response?.data?.error?.message ||
        (error as Error)?.message ||
        '初始化失败'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">初始化管理员</CardTitle>
          <CardDescription>
            首次使用前需要设置管理员登录密钥，并可选配置对外 API Key
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">管理员密钥</label>
              <Input
                type="password"
                placeholder="请输入管理员密钥"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">确认管理员密钥</label>
              <Input
                type="password"
                placeholder="再次输入管理员密钥"
                value={confirmAdminKey}
                onChange={(e) => setConfirmAdminKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">对外 API Key（可选）</label>
              <Input
                type="password"
                placeholder="可在后台随时修改"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                isSubmitting ||
                !adminKey.trim() ||
                !confirmAdminKey.trim()
              }
            >
              {isSubmitting ? '初始化中...' : '保存并继续'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAddCredentialBatch } from '@/hooks/use-credentials'
import { extractErrorMessage } from '@/lib/utils'
import type { BatchAddCredentialResponse } from '@/types/api'

interface AddCredentialBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type AuthMethod = 'social' | 'idc' | 'builder-id'

export function AddCredentialBatchDialog({
  open,
  onOpenChange,
}: AddCredentialBatchDialogProps) {
  const [tokens, setTokens] = useState('')
  const [authMethod, setAuthMethod] = useState<AuthMethod>('social')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [priority, setPriority] = useState('0')
  const [lastResult, setLastResult] = useState<BatchAddCredentialResponse | null>(null)

  const { mutate, isPending } = useAddCredentialBatch()

  const resetForm = () => {
    setTokens('')
    setClientId('')
    setClientSecret('')
    setPriority('0')
    setAuthMethod('social')
    setLastResult(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const list = tokens
      .split(/\r?\n/)
      .map((t) => t.trim())
      .filter(Boolean)

    if (list.length === 0) {
      toast.error('请至少输入一个 Refresh Token，每行一个')
      return
    }

    if (
      (authMethod === 'idc' || authMethod === 'builder-id') &&
      (!clientId.trim() || !clientSecret.trim())
    ) {
      toast.error('IdC/Builder-ID 认证需要填写 Client ID 和 Client Secret')
      return
    }

    mutate(
      {
        items: list.map((token) => ({
          refreshToken: token,
          authMethod,
          clientId: clientId.trim() || undefined,
          clientSecret: clientSecret.trim() || undefined,
          priority: parseInt(priority) || 0,
        })),
      },
      {
        onSuccess: (data) => {
          setLastResult(data)
          toast.success(
            `批量添加完成：成功 ${data.success}/${data.total}，失败 ${data.failed}`
          )
        },
        onError: (error) => {
          toast.error(`批量添加失败: ${extractErrorMessage(error)}`)
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          resetForm()
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>批量添加凭据</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Refresh Token 列表 <span className="text-red-500">*</span>
            </label>
            <textarea
              className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="每行一个 Refresh Token，自动忽略空行"
              value={tokens}
              onChange={(e) => setTokens(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">认证方式</label>
              <select
                value={authMethod}
                onChange={(e) => setAuthMethod(e.target.value as AuthMethod)}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="social">Social</option>
                <option value="idc">IdC</option>
                <option value="builder-id">Builder-ID</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">优先级</label>
              <input
                type="number"
                min="0"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {(authMethod === 'idc' || authMethod === 'builder-id') && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Client ID <span className="text-red-500">*</span>
                </label>
                <input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Client Secret <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  disabled={isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {lastResult && (
            <div className="rounded-md border border-dashed p-3 text-sm">
              <div className="font-medium mb-2">
                批量结果：成功 {lastResult.success}/{lastResult.total}，失败{' '}
                {lastResult.failed}
              </div>
              <div className="max-h-48 overflow-auto space-y-1">
                {lastResult.results.map((item) => (
                  <div
                    key={item.index}
                    className={item.success ? 'text-green-600' : 'text-red-500'}
                  >
                    #{item.index + 1} [{item.refreshTokenPreview}] —{' '}
                    {item.success ? '成功' : '失败'}：{item.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              disabled={isPending}
            >
              关闭
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '导入中...' : '批量导入'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

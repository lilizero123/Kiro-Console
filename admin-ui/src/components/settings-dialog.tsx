import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAdminSettings,
  updateAdminKey,
  updateApiKey,
} from '@/api/credentials'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdminKeyUpdated: () => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  onAdminKeyUpdated,
}: SettingsDialogProps) {
  const queryClient = useQueryClient()
  const [newApiKey, setNewApiKey] = useState('')
  const [newAdminKey, setNewAdminKey] = useState('')
  const [confirmAdminKey, setConfirmAdminKey] = useState('')

  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: getAdminSettings,
    enabled: open,
  })

  useEffect(() => {
    if (!open) {
      setNewApiKey('')
      setNewAdminKey('')
      setConfirmAdminKey('')
    } else {
      refetch()
    }
  }, [open, refetch])

  const apiMutation = useMutation({
    mutationFn: updateApiKey,
    onSuccess: () => {
      toast.success('API Key 已更新')
      setNewApiKey('')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: (error) => toast.error(readErrorMessage(error)),
  })

  const adminKeyMutation = useMutation({
    mutationFn: updateAdminKey,
    onSuccess: () => {
      toast.success('管理员密钥已更新，请重新登录')
      setNewAdminKey('')
      setConfirmAdminKey('')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      onOpenChange(false)
      onAdminKeyUpdated()
    },
    onError: (error) => toast.error(readErrorMessage(error)),
  })

  const handleUpdateApiKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newApiKey.trim()) {
      toast.error('请输入新的 API Key')
      return
    }
    apiMutation.mutate({ apiKey: newApiKey.trim() })
  }

  const handleUpdateAdminKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminKey.trim()) {
      toast.error('请输入新的管理员密钥')
      return
    }
    if (newAdminKey.trim() !== confirmAdminKey.trim()) {
      toast.error('两次输入的管理员密钥不一致')
      return
    }
    adminKeyMutation.mutate({ adminApiKey: newAdminKey.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>系统设置</DialogTitle>
          <DialogDescription>
            在此管理对外 API Key 和管理员登录密钥
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="py-10 text-center text-muted-foreground">
            加载中...
          </div>
        )}

        {!isLoading && (
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-medium">API Key</h3>
                <span className="text-sm text-muted-foreground">
                  {isFetching ? '刷新中...' : null}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {data?.apiKeyConfigured
                  ? `当前密钥：${data.apiKeyPreview ?? '***'}`
                  : '尚未配置 API Key，外部接口暂不可用'}
              </p>
              <form className="space-y-3" onSubmit={handleUpdateApiKey}>
                <Input
                  type="password"
                  placeholder="输入新的 API Key"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={apiMutation.isPending}
                  className="w-full"
                >
                  {apiMutation.isPending ? '保存中...' : '保存 API Key'}
                </Button>
              </form>
            </section>

            <section>
              <h3 className="text-base font-medium mb-2">管理员密钥</h3>
              <p className="text-sm text-muted-foreground mb-3">
                更新管理员密钥后需要使用新密钥重新登录
              </p>
              <form className="space-y-3" onSubmit={handleUpdateAdminKey}>
                <Input
                  type="password"
                  placeholder="输入新的管理员密钥"
                  value={newAdminKey}
                  onChange={(e) => setNewAdminKey(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="再次输入管理员密钥"
                  value={confirmAdminKey}
                  onChange={(e) => setConfirmAdminKey(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={adminKeyMutation.isPending}
                  className="w-full"
                >
                  {adminKeyMutation.isPending ? '保存中...' : '更新管理员密钥'}
                </Button>
              </form>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function readErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    (error as any).response?.data?.error?.message
  ) {
    return (error as any).response.data.error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return '操作失败，请稍后重试'
}

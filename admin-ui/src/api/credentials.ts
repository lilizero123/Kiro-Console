import axios from 'axios'
import { storage } from '@/lib/storage'
import type {
  CredentialsStatusResponse,
  BalanceResponse,
  SuccessResponse,
  SetDisabledRequest,
  SetPriorityRequest,
  AddCredentialRequest,
  AddCredentialResponse,
  BatchAddCredentialRequest,
  BatchAddCredentialResponse,
  SetupStatusResponse,
  InitAdminRequest,
  AdminSettingsResponse,
  UpdateApiKeyRequest,
  UpdateAdminKeyRequest,
} from '@/types/api'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器添加 API Key
api.interceptors.request.use((config) => {
  const apiKey = storage.getApiKey()
  if (apiKey) {
    config.headers['x-api-key'] = apiKey
  }
  return config
})

// 获取所有凭据状态
export async function getCredentials(): Promise<CredentialsStatusResponse> {
  const { data } = await api.get<CredentialsStatusResponse>('/credentials')
  return data
}

// 设置凭据禁用状态
export async function setCredentialDisabled(
  id: number,
  disabled: boolean
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>(
    `/credentials/${id}/disabled`,
    { disabled } as SetDisabledRequest
  )
  return data
}

// 设置凭据优先级
export async function setCredentialPriority(
  id: number,
  priority: number
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>(
    `/credentials/${id}/priority`,
    { priority } as SetPriorityRequest
  )
  return data
}

// 重置失败计数
export async function resetCredentialFailure(
  id: number
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>(`/credentials/${id}/reset`)
  return data
}

// 获取凭据余额
export async function getCredentialBalance(id: number): Promise<BalanceResponse> {
  const { data } = await api.get<BalanceResponse>(`/credentials/${id}/balance`)
  return data
}

// 添加新凭据
export async function addCredential(
  req: AddCredentialRequest
): Promise<AddCredentialResponse> {
  const { data } = await api.post<AddCredentialResponse>('/credentials', req)
  return data
}

// 批量添加凭据
export async function addCredentialsBatch(
  req: BatchAddCredentialRequest
): Promise<BatchAddCredentialResponse> {
  const { data } = await api.post<BatchAddCredentialResponse>(
    '/credentials/batch',
    req
  )
  return data
}

// 删除凭据
export async function deleteCredential(id: number): Promise<SuccessResponse> {
  const { data } = await api.delete<SuccessResponse>(`/credentials/${id}`)
  return data
}

// 初始化状态
export async function getSetupStatus(): Promise<SetupStatusResponse> {
  const { data } = await api.get<SetupStatusResponse>('/setup/status')
  return data
}

export async function initializeAdmin(
  req: InitAdminRequest
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>('/setup/init', req)
  return data
}

// 系统设置
export async function getAdminSettings(): Promise<AdminSettingsResponse> {
  const { data } = await api.get<AdminSettingsResponse>('/settings')
  return data
}

export async function updateApiKey(
  req: UpdateApiKeyRequest
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>('/settings/api-key', req)
  return data
}

export async function updateAdminKey(
  req: UpdateAdminKeyRequest
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>('/settings/admin-key', req)
  return data
}

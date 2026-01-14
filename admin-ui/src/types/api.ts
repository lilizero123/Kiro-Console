// 凭据状态响应
export interface CredentialsStatusResponse {
  total: number
  available: number
  currentId: number
  credentials: CredentialStatusItem[]
}

// 单个凭据状态
export interface CredentialStatusItem {
  id: number
  priority: number
  disabled: boolean
  failureCount: number
  isCurrent: boolean
  expiresAt: string | null
  authMethod: string | null
  hasProfileArn: boolean
}

// 余额响应
export interface BalanceResponse {
  id: number
  subscriptionTitle: string | null
  currentUsage: number
  usageLimit: number
  remaining: number
  usagePercentage: number
  nextResetAt: number | null
}

// 成功响应
export interface SuccessResponse {
  success: boolean
  message: string
}

// 错误响应
export interface AdminErrorResponse {
  error: {
    type: string
    message: string
  }
}

// 请求类型
export interface SetDisabledRequest {
  disabled: boolean
}

export interface SetPriorityRequest {
  priority: number
}

// 添加凭据请求
export interface AddCredentialRequest {
  refreshToken: string
  authMethod?: 'social' | 'idc' | 'builder-id'
  clientId?: string
  clientSecret?: string
  priority?: number
}

// 添加凭据响应
export interface AddCredentialResponse {
  success: boolean
  message: string
  credentialId: number
}

// 批量添加请求/响应
export interface BatchAddCredentialRequest {
  items: AddCredentialRequest[]
}

export interface BatchAddCredentialResult {
  index: number
  success: boolean
  message: string
  credentialId?: number
  refreshTokenPreview: string
}

export interface BatchAddCredentialResponse {
  total: number
  success: number
  failed: number
  results: BatchAddCredentialResult[]
}

// 初始化状态
export interface SetupStatusResponse {
  initialized: boolean
  apiKeyConfigured: boolean
}

export interface InitAdminRequest {
  adminApiKey: string
  apiKey?: string
}

export interface AdminSettingsResponse {
  adminInitialized: boolean
  apiKeyConfigured: boolean
  apiKeyPreview?: string | null
}

export interface UpdateApiKeyRequest {
  apiKey: string
}

export interface UpdateAdminKeyRequest {
  adminApiKey: string
}

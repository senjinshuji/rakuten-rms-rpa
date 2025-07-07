export interface LoginCredentials {
  rLoginId: string
  rLoginPassword: string
  userId: string
  userPassword: string
  twoFactorCode?: string
  startDate: string
  endDate: string
  platform: 'rakuten' | 'amazon' | 'qoo10'
}

export interface SalesData {
  date: string
  sales: number
  orderCount: number
  productName?: string
  productId?: string
}

export interface RPAStatus {
  status: 'idle' | 'logging_in' | 'waiting_2fa' | 'fetching_data' | 'completed' | 'error'
  message: string
  progress?: number
}
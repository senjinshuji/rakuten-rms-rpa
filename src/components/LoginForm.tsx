'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { LoginCredentials } from '@/types'
import { Calendar, Loader2 } from 'lucide-react'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginCredentials>({
    rLoginId: '',
    rLoginPassword: '',
    userId: '',
    userPassword: '',
    twoFactorCode: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    platform: 'rakuten'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await onSubmit(formData)
    setIsSubmitting(false)
  }

  const handleChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rLoginId">R-Login ID</Label>
          <Input
            id="rLoginId"
            type="text"
            value={formData.rLoginId}
            onChange={handleChange('rLoginId')}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rLoginPassword">R-Login パスワード</Label>
          <Input
            id="rLoginPassword"
            type="password"
            value={formData.rLoginPassword}
            onChange={handleChange('rLoginPassword')}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userId">ユーザーID</Label>
          <Input
            id="userId"
            type="text"
            value={formData.userId}
            onChange={handleChange('userId')}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userPassword">ユーザーパスワード</Label>
          <Input
            id="userPassword"
            type="password"
            value={formData.userPassword}
            onChange={handleChange('userPassword')}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="twoFactorCode">2段階認証コード（必要な場合）</Label>
          <Input
            id="twoFactorCode"
            type="text"
            value={formData.twoFactorCode}
            onChange={handleChange('twoFactorCode')}
            placeholder="6桁の数字"
            maxLength={6}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">開始日</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange('startDate')}
                  required
                  disabled={isSubmitting}
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">終了日</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange('endDate')}
                  required
                  disabled={isSubmitting}
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Label htmlFor="platform">プラットフォーム</Label>
          <select
            id="platform"
            value={formData.platform}
            onChange={handleChange('platform')}
            className="px-3 py-1 border rounded-md"
            disabled={isSubmitting}
          >
            <option value="rakuten">楽天</option>
            <option value="amazon" disabled>Amazon（未実装）</option>
            <option value="qoo10" disabled>Qoo10（未実装）</option>
          </select>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              処理中...
            </>
          ) : (
            'データ取得を開始'
          )}
        </Button>
      </div>
    </form>
  )
}
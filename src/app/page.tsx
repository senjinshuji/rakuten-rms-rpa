'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/LoginForm'
import { StatusDisplay } from '@/components/StatusDisplay'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginCredentials, RPAStatus } from '@/types'

export default function Home() {
  const [status, setStatus] = useState<RPAStatus>({
    status: 'idle',
    message: '待機中'
  })

  const handleSubmit = async (credentials: LoginCredentials) => {
    try {
      setStatus({ status: 'logging_in', message: 'RPAを起動中...' })
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error('スクレイピングに失敗しました')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = decoder.decode(value)
          const lines = text.trim().split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                setStatus(data)
              } catch (e) {
                console.error('Failed to parse SSE data:', e)
              }
            }
          }
        }
      }

      if (status.status === 'completed') {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'エラーが発生しました'
      })
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>楽天RMS売上データ取得システム</CardTitle>
            <CardDescription>
              楽天RMSから売上データを自動取得します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onSubmit={handleSubmit} />
            <StatusDisplay status={status} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
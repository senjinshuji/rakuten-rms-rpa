'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { RPAStatus } from '@/types'
import { CheckCircle2, Loader2, XCircle, AlertCircle, Clock } from 'lucide-react'

interface StatusDisplayProps {
  status: RPAStatus
}

export function StatusDisplay({ status }: StatusDisplayProps) {
  const getIcon = () => {
    switch (status.status) {
      case 'idle':
        return <Clock className="h-4 w-4" />
      case 'logging_in':
      case 'fetching_data':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'waiting_2fa':
        return <AlertCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'error':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getVariant = () => {
    switch (status.status) {
      case 'completed':
        return 'default'
      case 'error':
        return 'destructive'
      case 'waiting_2fa':
        return 'default'
      default:
        return 'default'
    }
  }

  if (status.status === 'idle') {
    return null
  }

  return (
    <Alert variant={getVariant()} className="mt-6">
      <div className="flex items-center space-x-2">
        {getIcon()}
        <AlertDescription>{status.message}</AlertDescription>
      </div>
      {status.progress !== undefined && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>
      )}
    </Alert>
  )
}
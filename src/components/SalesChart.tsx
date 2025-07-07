'use client'

import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { SalesData } from '@/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface SalesChartProps {
  data: SalesData[]
}

export function SalesChart({ data }: SalesChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    displayDate: format(new Date(item.date), 'MM/dd', { locale: ja }),
    売上: item.sales,
    注文数: item.orderCount
  }))

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">売上推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="売上"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">注文数推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toLocaleString()}件`} />
            <Legend />
            <Bar dataKey="注文数" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
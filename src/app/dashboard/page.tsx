'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SalesChart } from '@/components/SalesChart'
import { SalesData } from '@/types'
import { Download, Calendar, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function Dashboard() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [filteredData, setFilteredData] = useState<SalesData[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSalesData()
  }, [])

  useEffect(() => {
    filterData()
  }, [salesData, startDate, endDate])

  const fetchSalesData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/sales')
      if (!response.ok) throw new Error('データの取得に失敗しました')
      
      const data = await response.json()
      setSalesData(data)
      
      if (data.length > 0) {
        setStartDate(data[0].date)
        setEndDate(data[data.length - 1].date)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterData = () => {
    if (!startDate || !endDate) {
      setFilteredData(salesData)
      return
    }

    const filtered = salesData.filter(item => {
      return item.date >= startDate && item.date <= endDate
    })
    setFilteredData(filtered)
  }

  const downloadCSV = () => {
    const headers = ['日付', '売上', '注文数', '商品名', '商品ID']
    const rows = filteredData.map(item => [
      item.date,
      item.sales,
      item.orderCount,
      item.productName || '',
      item.productId || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `sales_data_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalSales = filteredData.reduce((sum, item) => sum + item.sales, 0)
  const totalOrders = filteredData.reduce((sum, item) => sum + item.orderCount, 0)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">売上データダッシュボード</h1>
          <div className="flex gap-2">
            <Button onClick={() => window.location.href = '/'} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              新規取得
            </Button>
            <Button onClick={downloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSVダウンロード
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>期間フィルタ</CardTitle>
              <CardDescription>表示する期間を選択</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filter-start">開始日</Label>
                <div className="relative">
                  <Input
                    id="filter-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-end">終了日</Label>
                <div className="relative">
                  <Input
                    id="filter-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>合計売上</CardTitle>
              <CardDescription>期間内の売上合計</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ¥{totalSales.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>合計注文数</CardTitle>
              <CardDescription>期間内の注文数合計</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {totalOrders.toLocaleString()} 件
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>売上推移</CardTitle>
            <CardDescription>日別の売上と注文数の推移</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <SalesChart data={filteredData} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
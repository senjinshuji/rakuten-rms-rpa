import { NextRequest, NextResponse } from 'next/server'
import { SalesData } from '@/types'

// モックデータ（実際にはFirestoreやGCSから取得）
const generateMockData = (): SalesData[] => {
  const data: SalesData[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      sales: Math.floor(Math.random() * 500000) + 100000,
      orderCount: Math.floor(Math.random() * 100) + 20,
      productName: `商品${Math.floor(Math.random() * 10) + 1}`,
      productId: `PRD${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`
    })
  }

  return data
}

export async function GET(request: NextRequest) {
  try {
    // 実際の実装では、FirestoreやGCSからデータを取得
    // const firestore = new Firestore()
    // const data = await firestore.collection('sales').get()
    
    const salesData = generateMockData()
    
    return NextResponse.json(salesData)
  } catch (error) {
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}
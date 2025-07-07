import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  const credentials = await request.json()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const scriptPath = path.join(process.cwd(), 'playwright', 'rakuten-scraper.js')
      
      const child = spawn('node', [
        scriptPath,
        credentials.rLoginId,
        credentials.rLoginPassword,
        credentials.userId,
        credentials.userPassword,
        credentials.twoFactorCode || '',
        credentials.startDate,
        credentials.endDate
      ], {
        env: {
          ...process.env,
          HEADLESS: 'true'
        }
      })

      child.stdout.on('data', (data) => {
        const message = data.toString()
        console.log('Scraper output:', message)
        
        try {
          if (message.includes('[')) {
            const match = message.match(/\[(\w+)\] (.+)/)
            if (match) {
              const [, status, msg] = match
              const progressMatch = msg.match(/(\d+)%/)
              const progress = progressMatch ? parseInt(progressMatch[1]) : undefined
              
              const sseData = `data: ${JSON.stringify({
                status,
                message: msg,
                progress
              })}\n\n`
              
              controller.enqueue(encoder.encode(sseData))
            }
          }
        } catch (error) {
          console.error('Failed to parse scraper output:', error)
        }
      })

      child.stderr.on('data', (data) => {
        console.error('Scraper error:', data.toString())
        const sseData = `data: ${JSON.stringify({
          status: 'error',
          message: data.toString()
        })}\n\n`
        controller.enqueue(encoder.encode(sseData))
      })

      child.on('close', (code) => {
        if (code === 0) {
          const sseData = `data: ${JSON.stringify({
            status: 'completed',
            message: 'データ取得が完了しました',
            progress: 100
          })}\n\n`
          controller.enqueue(encoder.encode(sseData))
        } else {
          const sseData = `data: ${JSON.stringify({
            status: 'error',
            message: `プロセスがエラーコード ${code} で終了しました`
          })}\n\n`
          controller.enqueue(encoder.encode(sseData))
        }
        controller.close()
      })
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
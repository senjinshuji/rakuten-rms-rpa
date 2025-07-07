import { Firestore } from '@google-cloud/firestore'

let firestore: Firestore | null = null

export function getFirestore() {
  if (!firestore && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firestore = new Firestore({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    })
  }
  return firestore
}

export interface DownloadRecord {
  platform: 'rakuten' | 'amazon' | 'qoo10'
  userId: string
  fileName: string
  gcsPath: string
  startDate: string
  endDate: string
  downloadedAt: Date
  status: 'completed' | 'failed' | 'processing'
  error?: string
}

export async function saveDownloadRecord(record: DownloadRecord) {
  const db = getFirestore()
  if (!db) {
    console.warn('Firestore not configured, skipping save')
    return null
  }

  const docRef = await db.collection('downloads').add(record)
  return docRef.id
}

export async function getDownloadRecords(
  userId?: string,
  platform?: string,
  limit = 100
) {
  const db = getFirestore()
  if (!db) {
    console.warn('Firestore not configured')
    return []
  }

  let query = db.collection('downloads')
    .orderBy('downloadedAt', 'desc')
    .limit(limit)

  if (userId) {
    query = query.where('userId', '==', userId)
  }

  if (platform) {
    query = query.where('platform', '==', platform)
  }

  const snapshot = await query.get()
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (DownloadRecord & { id: string })[]
}

export async function updateDownloadStatus(
  recordId: string,
  status: 'completed' | 'failed',
  error?: string
) {
  const db = getFirestore()
  if (!db) {
    console.warn('Firestore not configured')
    return
  }

  await db.collection('downloads').doc(recordId).update({
    status,
    ...(error && { error })
  })
}
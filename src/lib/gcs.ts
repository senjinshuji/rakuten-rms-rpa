import { Storage } from '@google-cloud/storage'

let storage: Storage | null = null

export function getStorage() {
  if (!storage && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    })
  }
  return storage
}

export async function uploadToGCS(
  bucketName: string,
  fileName: string,
  content: Buffer | string,
  metadata?: Record<string, string>
) {
  const storage = getStorage()
  if (!storage) {
    console.warn('GCS not configured, skipping upload')
    return null
  }

  const bucket = storage.bucket(bucketName)
  const file = bucket.file(fileName)

  await file.save(content, {
    metadata: {
      contentType: fileName.endsWith('.csv') ? 'text/csv' : 'application/octet-stream',
      metadata
    }
  })

  return `gs://${bucketName}/${fileName}`
}

export async function downloadFromGCS(
  bucketName: string,
  fileName: string
): Promise<Buffer | null> {
  const storage = getStorage()
  if (!storage) {
    console.warn('GCS not configured, skipping download')
    return null
  }

  const bucket = storage.bucket(bucketName)
  const file = bucket.file(fileName)

  try {
    const [content] = await file.download()
    return content
  } catch (error) {
    console.error('Error downloading from GCS:', error)
    return null
  }
}

export async function listGCSFiles(
  bucketName: string,
  prefix?: string
) {
  const storage = getStorage()
  if (!storage) {
    console.warn('GCS not configured')
    return []
  }

  const bucket = storage.bucket(bucketName)
  const [files] = await bucket.getFiles({ prefix })

  return files.map(file => ({
    name: file.name,
    size: file.metadata.size,
    created: file.metadata.timeCreated,
    updated: file.metadata.updated,
    metadata: file.metadata.metadata
  }))
}
import type { H3Event } from 'h3'

const VIEW_COUNT_KEY = 'viewCounts'
const SYNC_INTERVAL = 60000

let syncInterval: NodeJS.Timeout | null = null
let isSyncing = false

async function syncViewCounts(event: H3Event) {
  if (isSyncing) return

  isSyncing = true
  try {
    const storage = useStorage('cache')
    const counts = await storage.getItem<Record<number, number>>(VIEW_COUNT_KEY) || {}

    if (Object.keys(counts).length === 0) return

    const { db } = await import('~/database')
    const { articles } = await import('~/database/schema')
    const { eq, inArray, sql } = await import('drizzle-orm')

    const articleIds = Object.keys(counts).map(Number)

    for (const articleId of articleIds) {
      const increment = counts[articleId]
      if (increment && increment > 0) {
        await db
          .update(articles)
          .set({
            viewCount: sql`${articles.viewCount} + ${increment}`,
          })
          .where(eq(articles.id, articleId))
      }
    }

    await storage.removeItem(VIEW_COUNT_KEY)

    console.log(`Synced view counts for ${articleIds.length} articles`)
  } catch (error) {
    console.error('Failed to sync view counts:', error)
  } finally {
    isSyncing = false
  }
}

export async function incrementViewCount(articleId: number, event: H3Event): Promise<void> {
  const storage = useStorage('cache')
  const counts = await storage.getItem<Record<number, number>>(VIEW_COUNT_KEY) || {}

  counts[articleId] = (counts[articleId] || 0) + 1

  await storage.setItem(VIEW_COUNT_KEY, counts)
}

export function startViewCountSync(event: H3Event) {
  if (syncInterval) return

  syncInterval = setInterval(() => {
    syncViewCounts(event)
  }, SYNC_INTERVAL)
}

export function stopViewCountSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

import { defineEventHandler } from '#imports'

const VIEW_COUNT_KEY = 'viewCounts'

export default defineEventHandler(async () => {
  const storage = useStorage('cache')
  
  const counts = await storage.getItem<Record<number, number>>(VIEW_COUNT_KEY) || {}
  
  return {
    success: true,
    data: counts,
  }
})

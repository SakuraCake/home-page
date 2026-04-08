import { defineEventHandler } from 'h3'
import { useStorage } from 'nitropack/runtime'

export default defineEventHandler(async () => {
  const storage = useStorage()
  
  const cacheKeys = await storage.getKeys('cache:')
  const apiKeys = await storage.getKeys('api:')
  
  const cacheItems: { key: string; size?: number }[] = []
  
  for (const key of [...cacheKeys, ...apiKeys]) {
    const item = await storage.getItem(key)
    cacheItems.push({
      key,
      size: item ? JSON.stringify(item).length : 0,
    })
  }

  return {
    success: true,
    data: {
      totalItems: cacheItems.length,
      items: cacheItems,
      cacheKeys: cacheKeys.length,
      apiKeys: apiKeys.length,
    },
  }
})

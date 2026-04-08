import { defineEventHandler } from 'h3'
import { useStorage } from 'nitropack/runtime'

export default defineEventHandler(async () => {
  const storage = useStorage()
  
  const keys = await storage.getKeys('cache:')
  const apiKeys = await storage.getKeys('api:')
  
  let clearedCount = 0
  
  for (const key of keys) {
    await storage.removeItem(key)
    clearedCount++
  }
  
  for (const key of apiKeys) {
    await storage.removeItem(key)
    clearedCount++
  }

  return {
    success: true,
    message: `已清理 ${clearedCount} 个缓存项`,
    clearedCount,
    clearedKeys: [...keys, ...apiKeys],
  }
})

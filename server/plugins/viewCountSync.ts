import { startViewCountSync } from '../utils/viewCount'

export default defineNitroPlugin(() => {
  console.log('[Nitro Plugin] Starting view count sync service...')
  startViewCountSync()
})

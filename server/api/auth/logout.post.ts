import { defineEventHandler } from '#imports'

export default defineEventHandler(async () => {
  return {
    success: true,
    message: '登出成功'
  }
})

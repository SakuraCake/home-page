import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  return {
    success: true,
    message: '登出成功'
  }
})

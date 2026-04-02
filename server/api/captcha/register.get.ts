import { defineEventHandler } from '#imports'
import { registerCaptcha } from '~/server/utils/geetest'

export default defineEventHandler(async () => {
  const result = await registerCaptcha()
  
  return {
    success: result.success,
    gt: result.gt,
    challenge: result.challenge,
    new_captcha: result.new_captcha,
  }
})

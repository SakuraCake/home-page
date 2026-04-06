import { defineEventHandler } from 'h3'
import { registerCaptcha } from '~/server/utils/geetest'

export default defineEventHandler(async (event) => {
  const result = await registerCaptcha(event)

  return {
    success: result.success,
    gt: result.gt,
    challenge: result.challenge,
    new_captcha: result.new_captcha,
  }
})

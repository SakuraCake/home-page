import { defineEventHandler, readBody } from 'h3'
import { validateCaptcha } from '#server/utils/geetest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { geetest_challenge, geetest_validate, geetest_seccode } = body

  if (!geetest_challenge || !geetest_validate || !geetest_seccode) {
    return {
      success: false,
      message: '验证参数不完整',
    }
  }

  const result = await validateCaptcha(event, {
    challenge: geetest_challenge,
    validate: geetest_validate,
    seccode: geetest_seccode,
  })

  return {
    success: result.success,
    message: result.message,
  }
})

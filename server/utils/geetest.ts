import crypto from 'crypto'
import type { H3Event } from 'h3'
import { db } from '~/server/database'

const API_URL = 'http://api.geetest.com'
const REGISTER_URL = `${API_URL}/register.php`
const VALIDATE_URL = `${API_URL}/validate.php`

function md5(str: string): string {
  return crypto.createHash('md5').update(str).digest('hex')
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export interface CaptchaSettings {
  siteKey: string
  secretKey: string
}

export async function getCaptchaSettings(event: H3Event): Promise<CaptchaSettings> {
  const config = useRuntimeConfig(event)
  const dbConfig = await db.query.captchaConfig.findFirst()

  if (!dbConfig) {
    return {
      siteKey: config.geetestId || '',
      secretKey: config.geetestKey || '',
    }
  }

  return {
    siteKey: dbConfig.siteKey || config.geetestId || '',
    secretKey: dbConfig.secretKey || config.geetestKey || '',
  }
}

export interface GeetestRegisterResponse {
  success: number
  gt: string
  challenge: string
  new_captcha: boolean
}

export interface GeetestValidateParams {
  challenge: string
  validate: string
  seccode: string
}

export interface GeetestValidateResponse {
  success: boolean
  message?: string
}

export async function registerCaptcha(event: H3Event): Promise<GeetestRegisterResponse> {
  const settings = await getCaptchaSettings(event)
  const challenge = md5(settings.secretKey + Date.now() + randomInt(0, 10000))

  const params = new URLSearchParams({
    gt: settings.siteKey,
    challenge,
    user_id: '',
    json_format: '1',
    client_type: 'web',
    ip_address: '',
  })

  try {
    const response = await fetch(`${REGISTER_URL}?${params.toString()}`)
    const data = await response.json() as { challenge?: string }

    if (data.challenge) {
      return {
        success: 1,
        gt: settings.siteKey,
        challenge: md5(data.challenge + settings.secretKey),
        new_captcha: true,
      }
    }

    return {
      success: 0,
      gt: settings.siteKey,
      challenge: '',
      new_captcha: true,
    }
  } catch (_error) {
    return {
      success: 0,
      gt: settings.siteKey,
      challenge: '',
      new_captcha: true,
    }
  }
}

export async function validateCaptcha(event: H3Event, params: GeetestValidateParams): Promise<GeetestValidateResponse> {
  const { challenge, validate, seccode } = params
  const settings = await getCaptchaSettings(event)

  if (!challenge || !validate || !seccode) {
    return {
      success: false,
      message: '验证参数不完整',
    }
  }

  const encodeChallenge = md5(settings.secretKey + 'geetest' + challenge)

  if (validate !== encodeChallenge) {
    return {
      success: false,
      message: '验证失败',
    }
  }

  const requestParams = new URLSearchParams({
    gt: settings.siteKey,
    challenge,
    validate,
    seccode,
    json_format: '1',
  })

  try {
    const response = await fetch(VALIDATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestParams.toString(),
    })

    const data = await response.json() as { seccode?: string }

    if (data.seccode === md5(seccode)) {
      return {
        success: true,
      }
    }

    return {
      success: false,
      message: '二次验证失败',
    }
  } catch (_error) {
    return {
      success: false,
      message: '验证请求失败',
    }
  }
}

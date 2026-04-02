import crypto from 'crypto'
import { db } from '~/database'
import { captchaConfig } from '~/database/schema'

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

export async function getCaptchaSettings(): Promise<CaptchaSettings> {
  const config = await db.query.captchaConfig.findFirst()
  
  if (!config) {
    return {
      siteKey: process.env.GEETEST_ID || '6ee08588ab316e0d6b6363fe997c6dc8',
      secretKey: process.env.GEETEST_KEY || '76ebe69604c10b14336b8b79d390b461',
    }
  }
  
  return {
    siteKey: config.siteKey || process.env.GEETEST_ID || '',
    secretKey: config.secretKey || process.env.GEETEST_KEY || '',
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

export async function registerCaptcha(): Promise<GeetestRegisterResponse> {
  const settings = await getCaptchaSettings()
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
  } catch (error) {
    return {
      success: 0,
      gt: settings.siteKey,
      challenge: '',
      new_captcha: true,
    }
  }
}

export async function validateCaptcha(params: GeetestValidateParams): Promise<GeetestValidateResponse> {
  const { challenge, validate, seccode } = params
  const settings = await getCaptchaSettings()
  
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
  } catch (error) {
    return {
      success: false,
      message: '验证请求失败',
    }
  }
}

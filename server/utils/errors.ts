import { H3Error } from 'h3'

export class AppError extends H3Error {
  constructor(
    statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.statusCode = statusCode
    this.statusMessage = message
  }

  static badRequest(message: string, code?: string) {
    return new AppError(400, message, code)
  }

  static unauthorized(message = '未授权访问', code?: string) {
    return new AppError(401, message, code)
  }

  static forbidden(message = '禁止访问', code?: string) {
    return new AppError(403, message, code)
  }

  static notFound(message = '资源不存在', code?: string) {
    return new AppError(404, message, code)
  }

  static conflict(message: string, code?: string) {
    return new AppError(409, message, code)
  }

  static tooManyRequests(message = '请求过于频繁，请稍后再试', code?: string) {
    return new AppError(429, message, code)
  }

  static internal(message = '服务器内部错误', code?: string) {
    return new AppError(500, message, code)
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function handleError(error: unknown) {
  if (isAppError(error)) {
    return {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        statusCode: error.statusCode,
      },
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? '服务器内部错误' 
          : error.message,
        statusCode: 500,
      },
    }
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: '未知错误',
      statusCode: 500,
    },
  }
}

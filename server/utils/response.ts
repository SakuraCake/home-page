export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    statusCode: number
  }
}

export const ResponseUtil = {
  success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    }
  },

  error(message: string, code = 'ERROR', statusCode = 400): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        statusCode,
      },
    }
  },

  paginated<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number
  ): ApiResponse<{ list: T[]; total: number; page: number; pageSize: number }> {
    return {
      success: true,
      data: {
        list,
        total,
        page,
        pageSize,
      },
    }
  },
}

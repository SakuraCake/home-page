import type { ApiResponse } from '#shared/types/api'

export const ResponseUtil = {
  success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    }
  },

  error(message: string): ApiResponse {
    return {
      success: false,
      message,
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

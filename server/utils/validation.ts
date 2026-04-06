import type { H3Event } from 'h3'
import type { ZodSchema, ZodError } from 'zod'
import { createApiError } from './errors'

export async function validateBody<T>(
  event: H3Event,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await readBody(event)

  try {
    return schema.parse(body)
  } catch (error) {
    const zodError = error as ZodError
    const messages = zodError.issues.map((err: { path: any[]; message: any }) =>
      `${err.path.join('.')}: ${err.message}`
    ).join(', ')

    throw createApiError(400, messages || '输入数据验证失败', 'VALIDATION_ERROR')
  }
}

export async function validateQuery<T>(
  event: H3Event,
  schema: ZodSchema<T>
): Promise<T> {
  const query = getQuery(event)

  try {
    return schema.parse(query)
  } catch (error) {
    const zodError = error as ZodError
    const messages = zodError.issues.map((err: { path: any[]; message: any }) =>
      `${err.path.join('.')}: ${err.message}`
    ).join(', ')

    throw createApiError(400, messages || '查询参数验证失败', 'VALIDATION_ERROR')
  }
}

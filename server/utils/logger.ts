import type { H3Event } from 'h3'

export function defineLoggedEventHandler<T>(
  handler: (event: H3Event) => T | Promise<T>
) {
  return defineEventHandler(async (event) => {
    const start = event.context.startTime || Date.now()
    const requestId = event.context.requestId || 'unknown'

    try {
      const result = await handler(event)

      const duration = Date.now() - start
      const statusCode = event.node.res.statusCode

      console.log(JSON.stringify({
        level: 'info',
        time: new Date().toISOString(),
        requestId,
        message: 'Request completed',
        method: event.method,
        path: event.path,
        statusCode,
        duration,
      }))

      return result
    } catch (error) {
      const duration = Date.now() - start

      console.error(JSON.stringify({
        level: 'error',
        time: new Date().toISOString(),
        requestId,
        message: 'Request failed',
        method: event.method,
        path: event.path,
        duration,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : String(error),
      }))

      throw error
    }
  })
}

export default defineEventHandler(async (event) => {
  const start = Date.now()
  const requestId = crypto.randomUUID()

  event.context.requestId = requestId
  event.context.startTime = start

  const method = event.method
  const path = event.path
  const userAgent = getHeader(event, 'user-agent') || ''
  const ip = getClientIP(event)

  console.log(JSON.stringify({
    level: 'info',
    time: new Date().toISOString(),
    requestId,
    message: 'Request started',
    method,
    path,
    ip,
    userAgent,
  }))
})

function getClientIP(event: any): string {
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  if (xForwardedFor && typeof xForwardedFor === 'string') {
    const ips = xForwardedFor.split(',').map(ip => ip.trim())
    return ips[ips.length - 1] || 'unknown'
  }

  const xRealIP = getHeader(event, 'x-real-ip')
  if (xRealIP && typeof xRealIP === 'string') {
    return xRealIP
  }

  return event.node?.req?.socket?.remoteAddress || 'unknown'
}

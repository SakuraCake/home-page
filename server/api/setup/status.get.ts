import { statSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

function fileExists(filePath: string): boolean {
  try {
    statSync(filePath)
    return true
  } catch {
    return false
  }
}

export default defineEventHandler(async () => {
  const dbPath = join(cwd(), 'data.db')
  const envPath = join(cwd(), '.env')

  const dbExists = fileExists(dbPath)
  const envExists = fileExists(envPath)

  let hasAdmin = false
  let dbInitialized = false

  if (dbExists) {
    try {
      const { db } = await import('~/server/database')
      const { users } = await import('~/server/database/schema')
      const { eq } = await import('drizzle-orm')

      const adminUser = await db.query.users.findFirst({
        where: eq(users.role, 'admin')
      })
      hasAdmin = !!adminUser
      dbInitialized = true
    } catch {
      dbInitialized = false
    }
  }

  const needsSetup = !envExists || !dbExists || !hasAdmin

  return {
    needsSetup,
    envExists,
    dbExists,
    dbInitialized,
    hasAdmin,
    envExampleExists: fileExists(join(cwd(), '.env.example'))
  }
})

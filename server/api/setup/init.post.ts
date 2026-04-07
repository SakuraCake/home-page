import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
import crypto from 'node:crypto'
import { z } from 'zod'
import { hash } from 'bcrypt'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

const SetupSchema = z.object({
  siteName: z.string().min(1).max(100),
  adminUsername: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  adminPassword: z.string().min(8).max(100),
  adminEmail: z.string().email().optional().or(z.literal('')),
  jwtSecret: z.string().min(32).optional(),
})

const DB_PATH = join(cwd(), 'data.db')
const ENV_PATH = join(cwd(), '.env')

function generateJwtSecret(): string {
  return crypto.randomBytes(64).toString('hex')
}

async function createEnvFile(jwtSecret: string): Promise<void> {
  const envContent = `# JWT Configuration
# Generated automatically by OOBE
NUXT_JWT_SECRET=${jwtSecret}

# Geetest Captcha Configuration (Optional)
NUXT_GEETEST_ID=
NUXT_GEETEST_KEY=

# Database
NUXT_DATABASE_URL=./data.db

# Rate Limiting
NUXT_RATE_LIMIT_MAX=100
NUXT_RATE_LIMIT_WINDOW_MS=900000

# Security
NUXT_SESSION_MAX_AGE=604800
`
  await writeFile(ENV_PATH, envContent, 'utf-8')
}

async function runDbPush(): Promise<void> {
  const { execSync } = await import('node:child_process')
  console.log('[Setup] Running db:push...')
  execSync('pnpm db:push', { cwd: cwd(), stdio: 'pipe' })
  console.log('[Setup] db:push completed')
}

function checkTableExists(tableName: string): boolean {
  try {
    const sqlite = new Database(DB_PATH)
    const result = sqlite.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName)
    sqlite.close()
    return !!result
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, SetupSchema.parse)

  const results = {
    envCreated: false,
    dbCreated: false,
    adminCreated: false,
    siteConfigured: false,
  }

  try {
    if (!existsSync(ENV_PATH)) {
      const jwtSecret = body.jwtSecret || generateJwtSecret()
      await createEnvFile(jwtSecret)
      results.envCreated = true
      process.env.NUXT_JWT_SECRET = jwtSecret
    }

    const dbExists = existsSync(DB_PATH)
    if (!dbExists || !checkTableExists('site_config')) {
      await runDbPush()
      results.dbCreated = true
    }

    const schema = await import('~/server/database/schema')
    const { eq } = await import('drizzle-orm')
    const sqlite = new Database(DB_PATH)
    const db = drizzle(sqlite, { schema })

    const now = Date.now()

    const existingSiteConfig = await db.query.siteConfig.findFirst()
    if (!existingSiteConfig) {
      await db.insert(schema.siteConfig).values({
        siteName: body.siteName,
        siteDescription: '',
        siteKeywords: '',
        siteUrl: '',
        logo: '',
        favicon: '',
        footerText: '',
        icp: '',
        analyticsCode: '',
        postsPerPage: 10,
        allowRegister: true,
        allowComment: true,
        commentNeedReview: false,
        socialLinks: '[]',
        bangumiUsername: '',
        updatedAt: now,
      })
    } else {
      await db
        .update(schema.siteConfig)
        .set({
          siteName: body.siteName,
          updatedAt: now
        })
        .where(eq(schema.siteConfig.id, existingSiteConfig.id))
    }
    results.siteConfigured = true

    const existingCaptchaConfig = await db.query.captchaConfig.findFirst()
    if (!existingCaptchaConfig) {
      await db.insert(schema.captchaConfig).values({
        enabled: false,
        provider: 'geetest',
        siteKey: '',
        secretKey: '',
        loginEnabled: false,
        registerEnabled: false,
        commentEnabled: false,
        updatedAt: now,
      })
    }

    const existingAdmin = await db.query.users.findFirst({
      where: eq(schema.users.role, 'admin')
    })

    if (existingAdmin) {
      sqlite.close()
      throw createError({
        statusCode: 403,
        statusMessage: 'Setup Already Completed',
        message: '系统已完成安装，管理员账户已存在',
      })
    }

    const hashedPassword = await hash(body.adminPassword, 12)

    await db.insert(schema.users).values({
      username: body.adminUsername,
      password: hashedPassword,
      email: body.adminEmail || null,
      role: 'admin',
      avatar: null,
      createdAt: now,
      updatedAt: now,
    })
    results.adminCreated = true

    sqlite.close()

    return {
      success: true,
      message: 'Setup completed successfully',
      results,
    }
  } catch (error) {
    console.error('Setup error:', error)
    if ((error as any).statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Setup Failed',
      message: error instanceof Error ? error.message : 'An error occurred during setup',
    })
  }
})

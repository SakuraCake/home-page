import { db } from '../server/database'
import { users } from '../server/database/schema'
import { eq } from 'drizzle-orm'

const username = process.argv[2]

if (!username) {
  console.log('用法: pnpm tsx scripts/set-admin.ts <用户名>')
  console.log('示例: pnpm tsx scripts/set-admin.ts myuser')
  process.exit(1)
}

async function setAdmin() {
  const user = await db.query.users.findFirst({
    where: eq(users.username, username)
  })

  if (!user) {
    console.log(`用户 "${username}" 不存在`)
    process.exit(1)
  }

  await db
    .update(users)
    .set({ role: 'admin', updatedAt: Date.now() })
    .where(eq(users.id, user.id))

  console.log(`用户 "${username}" 已设置为管理员`)
}

setAdmin()

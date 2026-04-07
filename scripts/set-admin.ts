import { db } from '../server/database'
import { users } from '../server/database/schema'
import { eq } from 'drizzle-orm'

async function setAdmin() {
  const username = 'SakuraCake'
  
  const user = await db.query.users.findFirst({
    where: eq(users.username, username)
  })

  if (!user) {
    console.log(`用户 ${username} 不存在`)
    return
  }

  await db
    .update(users)
    .set({ role: 'admin', updatedAt: Date.now() })
    .where(eq(users.id, user.id))

  console.log(`用户 ${username} 已设置为管理员`)
}

setAdmin()

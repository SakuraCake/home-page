import { defineEventHandler, readBody, createError } from '#imports'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { users } from '~/database/schema'
import { requireAuth } from '~/server/utils/session'
import { verifyPassword, hashPassword } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  const { oldPassword, newPassword } = body

  if (!oldPassword || !newPassword) {
    return {
      success: false,
      message: '请填写完整信息'
    }
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      message: '新密码至少 6 个字符'
    }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId)
  })

  if (!user) {
    return {
      success: false,
      message: '用户不存在'
    }
  }

  const isValid = await verifyPassword(oldPassword, user.password)
  if (!isValid) {
    return {
      success: false,
      message: '当前密码错误'
    }
  }

  const hashedPassword = await hashPassword(newPassword)

  await db
    .update(users)
    .set({
      password: hashedPassword,
      updatedAt: Date.now()
    })
    .where(eq(users.id, session.userId))

  return {
    success: true,
    message: '密码修改成功'
  }
})

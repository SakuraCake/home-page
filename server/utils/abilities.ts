import { Ability, AbilityBuilder } from '@casl/ability'
import type { AbilityClass } from '@casl/ability'
import { createError } from 'h3'
import type { User, Article, Category, Tag, Comment } from '#shared/types/api'
import type { UserSession } from '#server/utils/session'

type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'
type Subjects = 'Article' | 'Category' | 'Tag' | 'Comment' | 'User' | Article | Category | Tag | Comment | User | 'all'

export type AppAbility = Ability<[Actions, Subjects]>

const AppAbility = Ability as AbilityClass<AppAbility>

export function defineAbilitiesFor(session: UserSession | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder(AppAbility)

  if (!session) {
    can('read', 'Article')
    can('read', 'Category')
    can('read', 'Tag')
    can('read', 'Comment')
    return build()
  }

  const role = session.role

  if (role === 'admin') {
    can('manage', 'all')
  } else {
    can('read', 'Article')
    can('read', 'Category')
    can('read', 'Tag')
    can('read', 'Comment')
    can('create', 'Comment')
    can('update', 'Comment', { userId: session.userId })
    can('delete', 'Comment', { userId: session.userId })
  }

  return build()
}

export function forbid(): never {
  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden',
    message: 'You do not have permission to perform this action',
  })
}

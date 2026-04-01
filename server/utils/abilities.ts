import { Ability, AbilityBuilder, AbilityClass, MongoQuery, ExtractSubjectType } from '@casl/ability'
import { createError } from 'h3'
import type { UserSession } from './session'
import type { users, articles, categories, tags, comments } from '~/database/schema'

type User = typeof users.$inferSelect
type Article = typeof articles.$inferSelect
type Category = typeof categories.$inferSelect
type Tag = typeof tags.$inferSelect
type Comment = typeof comments.$inferSelect

export type Subjects = 'User' | 'Article' | 'Category' | 'Tag' | 'Comment'
export type Subject = User | Article | Category | Tag | Comment | Subjects

export type Action = 'create' | 'read' | 'update' | 'delete'

export type AppAbility = Ability<[Action, Subject], MongoQuery>

const AppAbilityClass = Ability as AbilityClass<AppAbility>

function detectSubjectType(subject: Subject): ExtractSubjectType<Subject> {
  if (typeof subject === 'string') return subject as ExtractSubjectType<Subject>
  if ('authorId' in subject && 'viewCount' in subject) return 'Article' as ExtractSubjectType<Subject>
  if ('email' in subject && 'password' in subject) return 'User' as ExtractSubjectType<Subject>
  if ('slug' in subject && 'description' in subject) return 'Category' as ExtractSubjectType<Subject>
  if ('slug' in subject && !('description' in subject)) return 'Tag' as ExtractSubjectType<Subject>
  if ('articleId' in subject && 'parentId' in subject) return 'Comment' as ExtractSubjectType<Subject>
  return 'Object' as ExtractSubjectType<Subject>
}

export function defineAbilitiesFor(user: UserSession | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder(AppAbilityClass)

  if (!user) {
    return build({ detectSubjectType })
  }

  if (user.role === 'admin') {
    can('create', 'Article')
    can('read', 'Article')
    can('update', 'Article')
    can('delete', 'Article')

    can('create', 'Category')
    can('read', 'Category')
    can('update', 'Category')
    can('delete', 'Category')

    can('create', 'Tag')
    can('read', 'Tag')
    can('update', 'Tag')
    can('delete', 'Tag')

    can('create', 'Comment')
    can('read', 'Comment')
    can('update', 'Comment')
    can('delete', 'Comment')

    can('create', 'User')
    can('read', 'User')
    can('update', 'User')
    can('delete', 'User')
  } else if (user.role === 'user') {
    can('create', 'Article')
    can('read', 'Article')
    can('update', 'Article', { authorId: user.userId })
    can('delete', 'Article', { authorId: user.userId })

    can('read', 'Category')

    can('read', 'Tag')

    can('create', 'Comment')
    can('read', 'Comment')
    can('delete', 'Comment', { userId: user.userId })

    can('read', 'User', { id: user.userId })
    can('update', 'User', { id: user.userId })
  }

  return build({ detectSubjectType })
}

export function can(
  ability: AppAbility,
  action: Action,
  subject: Subject,
  resource?: any
): boolean {
  if (resource) {
    return ability.can(action, resource)
  }
  return ability.can(action, subject)
}

export function forbid(): never {
  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden',
    message: 'You do not have permission to perform this action',
  })
}

import { ClientUser } from '@/shared/types/types'

export function checkIsAdmin(
  currentUser: ClientUser | null | undefined,
  adminsList: string[],
): boolean {
  if (currentUser && currentUser.email) {
    const emailLower = currentUser.email.toLowerCase()
    const isInAdminsList = adminsList.some((email) => email.toLowerCase() === emailLower)
    const hasAdminFlag = !!currentUser.isAdmin
    return isInAdminsList || hasAdminFlag
  }
  return false
}

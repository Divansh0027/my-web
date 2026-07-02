import { ClientUser } from "../types";

export function checkIsAdmin(
  currentUser: ClientUser | null | undefined,
  adminsList: string[],
  defaultAdminsStr: string = ""
): boolean {
  if (currentUser && currentUser.email) {
    const emailLower = currentUser.email.toLowerCase();
    
    const defaultAdmins = defaultAdminsStr
      ? defaultAdminsStr.split(',').map((e: string) => e.trim().toLowerCase()) 
      : [];
    
    const isInAdminsList = adminsList.some(
      email => email.toLowerCase() === emailLower
    ) || defaultAdmins.includes(emailLower);
    
    const hasAdminFlag = !!currentUser.isAdmin;
    return isInAdminsList || hasAdminFlag;
  }
  return false;
}

export type MembershipRole = "owner" | "manager" | "cleaner";

export const ROLE_LABELS: Record<MembershipRole, string> = {
  owner: "Owner",
  manager: "Manager / Supervisor",
  cleaner: "Cleaner",
};

export function canManageTeam(role: MembershipRole) {
  return role === "owner" || role === "manager";
}

export function canManageJobs(role: MembershipRole) {
  return canManageTeam(role);
}

export function canReviewJobs(role: MembershipRole) {
  return role === "owner" || role === "manager";
}

export function canManageBilling(role: MembershipRole) {
  return role === "owner";
}

export function canManageIssues(role: MembershipRole) {
  return role === "owner" || role === "manager";
}

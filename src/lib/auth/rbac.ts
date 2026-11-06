import type { MembershipRole } from "@/lib/constants/roles";
import { getMembershipForUser } from "@/lib/db/queries";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import type { SessionPayload } from "./session";

export async function requireValidSession(session: SessionPayload | null): Promise<SessionPayload> {
  if (!session) throw new UnauthorizedError();
  const membership = await getMembershipForUser(session.userId, session.organizationId);
  if (!membership || membership.status !== "active") throw new UnauthorizedError();
  if (membership.role !== session.role) throw new UnauthorizedError();
  return {
    userId: session.userId,
    organizationId: session.organizationId,
    role: membership.role,
  };
}

/** @deprecated use requireValidSession */
export function requireSession(session: SessionPayload | null): SessionPayload {
  if (!session) throw new UnauthorizedError();
  return session;
}

export function requireRole(session: SessionPayload, roles: MembershipRole[]) {
  if (!roles.includes(session.role)) throw new ForbiddenError();
}

export function requireOrgMatch(session: SessionPayload, organizationId: string) {
  if (session.organizationId !== organizationId) throw new ForbiddenError();
}

export function canAccessJob(
  session: SessionPayload,
  job: { organizationId: string; assignedUserId: string | null },
): boolean {
  if (job.organizationId !== session.organizationId) return false;
  if (session.role === "owner" || session.role === "manager") return true;
  return job.assignedUserId === session.userId;
}

export function assertJobAccess(
  session: SessionPayload,
  job: { organizationId: string; assignedUserId: string | null },
) {
  if (!canAccessJob(session, job)) throw new NotFoundError();
  requireOrgMatch(session, job.organizationId);
}

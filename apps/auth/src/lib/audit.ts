import { prisma } from './prisma';
import { headers } from 'next/headers';

// Audit action types
export type AuditAction = 
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_RESET_REQUESTED' 
  | 'PASSWORD_RESET_COMPLETED' | 'EMAIL_VERIFIED'
  | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED'
  | 'ORG_CREATED' | 'ORG_UPDATED' | 'ORG_DELETED'
  | 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'MEMBER_ROLE_CHANGED'
  | 'INVITATION_SENT' | 'INVITATION_ACCEPTED' | 'INVITATION_REVOKED'
  | 'PERMISSION_GRANTED' | 'PERMISSION_REVOKED' | 'ROLE_CREATED' 
  | 'ROLE_UPDATED' | 'ROLE_DELETED'
  | 'SETTINGS_UPDATED' | 'OAUTH_CONNECTED' | 'OAUTH_DISCONNECTED' 
  | 'CUSTOM';

export interface AuditContext {
  userId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
}

export interface AuditLogEntry {
  action: AuditAction;
  context: AuditContext;
  metadata?: Record<string, unknown>;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
}

// Get request context from headers
async function getRequestContext(): Promise<Partial<AuditContext>> {
  try {
    const headersList = await headers();
    return {
      ipAddress: headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? undefined,
      userAgent: headersList.get('user-agent') ?? undefined,
    };
  } catch {
    return {};
  }
}

// Log an audit event
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const requestContext = await getRequestContext();
  
  await prisma.auditLog.create({
    data: {
      action: entry.action,
      userId: entry.context.userId,
      organizationId: entry.context.organizationId,
      ipAddress: entry.context.ipAddress ?? requestContext.ipAddress,
      userAgent: entry.context.userAgent ?? requestContext.userAgent,
      resourceType: entry.context.resourceType,
      resourceId: entry.context.resourceId,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      changes: entry.changes ? JSON.stringify(entry.changes) : null,
    },
  });
}

// Pre-built audit log functions for common events

export async function logLogin(userId: string, metadata?: Record<string, unknown>) {
  await logAuditEvent({
    action: 'LOGIN',
    context: { userId },
    metadata,
  });
}

export async function logLogout(userId: string, metadata?: Record<string, unknown>) {
  await logAuditEvent({
    action: 'LOGOUT',
    context: { userId },
    metadata,
  });
}

export async function logLoginFailed(email: string, metadata?: Record<string, unknown>) {
  await logAuditEvent({
    action: 'LOGIN_FAILED',
    context: {},
    metadata: { email, ...metadata },
  });
}

export async function logUserCreated(userId: string, metadata?: Record<string, unknown>) {
  await logAuditEvent({
    action: 'USER_CREATED',
    context: { userId, resourceType: 'user', resourceId: userId },
    metadata,
  });
}

export async function logUserUpdated(
  userId: string,
  changes: { before?: Record<string, unknown>; after?: Record<string, unknown> }
) {
  await logAuditEvent({
    action: 'USER_UPDATED',
    context: { userId, resourceType: 'user', resourceId: userId },
    changes,
  });
}

export async function logUserDeleted(userId: string) {
  await logAuditEvent({
    action: 'USER_DELETED',
    context: { userId, resourceType: 'user', resourceId: userId },
  });
}

export async function logOrganizationCreated(
  organizationId: string,
  createdByUserId: string,
  metadata?: Record<string, unknown>
) {
  await logAuditEvent({
    action: 'ORG_CREATED',
    context: {
      userId: createdByUserId,
      organizationId,
      resourceType: 'organization',
      resourceId: organizationId,
    },
    metadata,
  });
}

export async function logOrganizationUpdated(
  organizationId: string,
  userId: string,
  changes: { before?: Record<string, unknown>; after?: Record<string, unknown> }
) {
  await logAuditEvent({
    action: 'ORG_UPDATED',
    context: {
      userId,
      organizationId,
      resourceType: 'organization',
      resourceId: organizationId,
    },
    changes,
  });
}

export async function logOrganizationDeleted(
  organizationId: string,
  userId: string
) {
  await logAuditEvent({
    action: 'ORG_DELETED',
    context: {
      userId,
      resourceType: 'organization',
      resourceId: organizationId,
    },
  });
}

export async function logMemberAdded(
  organizationId: string,
  userId: string,
  addedByUserId: string,
  role: string
) {
  await logAuditEvent({
    action: 'MEMBER_ADDED',
    context: {
      userId: addedByUserId,
      organizationId,
      resourceType: 'membership',
    },
    metadata: { targetUserId: userId, role },
  });
}

export async function logMemberRemoved(
  organizationId: string,
  userId: string,
  removedByUserId: string
) {
  await logAuditEvent({
    action: 'MEMBER_REMOVED',
    context: {
      userId: removedByUserId,
      organizationId,
      resourceType: 'membership',
    },
    metadata: { targetUserId: userId },
  });
}

export async function logMemberRoleChanged(
  organizationId: string,
  userId: string,
  changedByUserId: string,
  oldRole: string,
  newRole: string
) {
  await logAuditEvent({
    action: 'MEMBER_ROLE_CHANGED',
    context: {
      userId: changedByUserId,
      organizationId,
      resourceType: 'membership',
    },
    metadata: { targetUserId: userId, oldRole, newRole },
  });
}

export async function logInvitationSent(
  organizationId: string,
  email: string,
  sentByUserId: string,
  role: string
) {
  await logAuditEvent({
    action: 'INVITATION_SENT',
    context: {
      userId: sentByUserId,
      organizationId,
      resourceType: 'invitation',
    },
    metadata: { email, role },
  });
}

export async function logInvitationAccepted(
  organizationId: string,
  email: string,
  userId: string
) {
  await logAuditEvent({
    action: 'INVITATION_ACCEPTED',
    context: {
      userId,
      organizationId,
      resourceType: 'invitation',
    },
    metadata: { email },
  });
}

export async function logInvitationRevoked(
  organizationId: string,
  revokedByUserId: string,
  invitationId: string
) {
  await logAuditEvent({
    action: 'INVITATION_REVOKED',
    context: {
      userId: revokedByUserId,
      organizationId,
      resourceType: 'invitation',
      resourceId: invitationId,
    },
  });
}

export async function logPermissionGranted(
  organizationId: string,
  userId: string,
  grantedByUserId: string,
  permission: string,
  roleName: string
) {
  await logAuditEvent({
    action: 'PERMISSION_GRANTED',
    context: {
      userId: grantedByUserId,
      organizationId,
      resourceType: 'role',
    },
    metadata: { targetUserId: userId, permission, roleName },
  });
}

export async function logPermissionRevoked(
  organizationId: string,
  userId: string,
  revokedByUserId: string,
  permission: string,
  roleName: string
) {
  await logAuditEvent({
    action: 'PERMISSION_REVOKED',
    context: {
      userId: revokedByUserId,
      organizationId,
      resourceType: 'role',
    },
    metadata: { targetUserId: userId, permission, roleName },
  });
}

export async function logOAuthConnected(
  userId: string,
  provider: string,
  metadata?: Record<string, unknown>
) {
  await logAuditEvent({
    action: 'OAUTH_CONNECTED',
    context: {
      userId,
      resourceType: 'account',
    },
    metadata: { provider, ...metadata },
  });
}

export async function logOAuthDisconnected(
  userId: string,
  provider: string,
  metadata?: Record<string, unknown>
) {
  await logAuditEvent({
    action: 'OAUTH_DISCONNECTED',
    context: {
      userId,
      resourceType: 'account',
    },
    metadata: { provider, ...metadata },
  });
}

export async function logSettingsUpdated(
  organizationId: string,
  userId: string,
  changes: { before?: Record<string, unknown>; after?: Record<string, unknown> }
) {
  await logAuditEvent({
    action: 'SETTINGS_UPDATED',
    context: {
      userId,
      organizationId,
      resourceType: 'settings',
    },
    changes,
  });
}

// Query audit logs with filters
export async function queryAuditLogs(params: {
  organizationId?: string;
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (params.organizationId) {
    where.organizationId = params.organizationId;
  }
  if (params.userId) {
    where.userId = params.userId;
  }
  if (params.action) {
    where.action = params.action;
  }
  if (params.startDate || params.endDate) {
    where.timestamp = {};
    if (params.startDate) {
      (where.timestamp as Record<string, Date>).gte = params.startDate;
    }
    if (params.endDate) {
      (where.timestamp as Record<string, Date>).lte = params.endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: params.limit ?? 50,
      skip: params.offset ?? 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}
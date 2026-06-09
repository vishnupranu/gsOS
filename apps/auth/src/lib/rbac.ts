import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

// Membership role types
export type MembershipRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';

// Role hierarchy - higher roles inherit permissions from lower roles
export const roleHierarchy: Record<MembershipRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  GUEST: 1,
};

// Built-in permissions
export const PERMISSIONS = {
  // User permissions
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  
  // Organization permissions
  ORG_READ: 'org:read',
  ORG_WRITE: 'org:write',
  ORG_DELETE: 'org:delete',
  ORG_MANAGE_MEMBERS: 'org:manage_members',
  
  // Role/Permission management
  ROLES_READ: 'roles:read',
  ROLES_WRITE: 'roles:write',
  
  // Audit log permissions
  AUDIT_READ: 'audit:read',
  
  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  
  // Billing
  BILLING_READ: 'billing:read',
  BILLING_WRITE: 'billing:write',
} as const;

// Role to base permissions mapping
export const roleDefaultPermissions: Record<MembershipRole, string[]> = {
  OWNER: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.ORG_READ,
    PERMISSIONS.ORG_WRITE,
    PERMISSIONS.ORG_MANAGE_MEMBERS,
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_WRITE,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_WRITE,
  ],
  MEMBER: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.ORG_READ,
    PERMISSIONS.SETTINGS_READ,
  ],
  GUEST: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.USERS_READ,
  ],
};

export interface AuthUser {
  id: string;
  email: string;
  organizations: Array<{
    id: string;
    slug: string;
    role: string;
  }>;
  orgRoles: Array<{
    organizationId: string;
    roleId: string;
    roleName: string;
    permissions: string[];
  }>;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    organizations: session.user.organizations,
    orgRoles: session.user.orgRoles,
  };
}

export async function checkOrganizationRole(
  organizationId: string,
  requiredRole: string
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const membership = user.organizations.find(
    (org) => org.id === organizationId
  );

  if (!membership) return false;

  const userRole = membership.role as MembershipRole;
  const reqRole = requiredRole as MembershipRole;
  const userRoleLevel = roleHierarchy[userRole] ?? 0;
  const requiredRoleLevel = roleHierarchy[reqRole] ?? 0;

  return userRoleLevel >= requiredRoleLevel;
}

export async function checkOrganizationPermission(
  organizationId: string,
  permission: string
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Check base role permissions
  const membership = user.organizations.find(
    (org) => org.id === organizationId
  );

  if (membership) {
    const role = membership.role as MembershipRole;
    const basePermissions = roleDefaultPermissions[role] ?? [];
    if (basePermissions.includes(permission)) {
      return true;
    }
  }

  // Check custom organization roles
  const orgRole = user.orgRoles.find(
    (r) => r.organizationId === organizationId
  );

  if (orgRole?.permissions.includes(permission)) {
    return true;
  }

  return false;
}

export async function requireOrganizationRole(
  organizationId: string,
  requiredRole: string
): Promise<void> {
  const hasRole = await checkOrganizationRole(organizationId, requiredRole);
  if (!hasRole) {
    throw new Error(`Required role: ${requiredRole}`);
  }
}

export async function requireOrganizationPermission(
  organizationId: string,
  permission: string
): Promise<void> {
  const hasPermission = await checkOrganizationPermission(
    organizationId,
    permission
  );
  if (!hasPermission) {
    throw new Error(`Required permission: ${permission}`);
  }
}

// Utility to check if user can manage another user
export async function canManageUser(
  targetUserId: string,
  organizationId: string
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const membership = user.organizations.find(
    (org) => org.id === organizationId
  );

  if (!membership) return false;

  // Owners and Admins can manage all users
  if (membership.role === 'OWNER' || membership.role === 'ADMIN') {
    return true;
  }

  // For MEMBER role, can only manage guests
  const targetMembership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: targetUserId,
        organizationId,
      },
    },
  });

  if (!targetMembership) return false;

  // Can only manage users with lower or equal role (except own)
  const userRole = membership.role as MembershipRole;
  const targetRole = targetMembership.role as MembershipRole;
  const userRoleLevel = roleHierarchy[userRole] ?? 0;
  const targetRoleLevel = roleHierarchy[targetRole] ?? 0;

  return (
    targetUserId !== user.id &&
    userRoleLevel > targetRoleLevel
  );
}

// Create a custom organization role
export async function createOrganizationRole(
  organizationId: string,
  name: string,
  permissions: string[],
  description?: string
) {
  return prisma.organizationRole.create({
    data: {
      organizationId,
      name,
      permissions: JSON.stringify(permissions),
      description,
    },
  });
}

// Assign role to user
export async function assignOrganizationRole(
  userId: string,
  organizationId: string,
  roleId: string
) {
  return prisma.organizationUserRole.create({
    data: {
      userId,
      organizationId,
      roleId,
    },
  });
}

// Remove role from user
export async function removeOrganizationRole(
  userId: string,
  organizationId: string,
  roleId: string
) {
  return prisma.organizationUserRole.delete({
    where: {
      userId_organizationId_roleId: {
        userId,
        organizationId,
        roleId,
      },
    },
  });
}
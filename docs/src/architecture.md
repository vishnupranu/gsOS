# Architecture Overview

## System Design

This monorepo follows a layered architecture pattern with clear separation of concerns.

```
┌─────────────────────────────────────────────────────┐
│                   Applications                        │
│  (apps/*) - @monorepo/auth                           │
├─────────────────────────────────────────────────────┤
│                   Packages                           │
│  (packages/*)                                      │
├─────────────────────────────────────────────────────┤
│                   Shared Configuration               │
│  (@monorepo/eslint-config, @monorepo/tsconfig)     │
└─────────────────────────────────────────────────────┘
```

## Key Principles

1. **Shared Configuration**: Common ESLint and TypeScript configs are centralized
2. **Explicit Dependencies**: Packages explicitly declare their dependencies
3. **Type Safety**: TypeScript strict mode enabled across all packages
4. **Build Verification**: All packages support build and type checking

## Package Categories

### Configuration Packages
- `@monorepo/tsconfig` - Shared TypeScript configurations
- `@monorepo/eslint-config` - Shared ESLint configurations

### Applications
- `@monorepo/auth` - Authentication system (NextAuth.js)
- `docs/` - Documentation site generator

## Authentication System (`@monorepo/auth`)

### Features
- **OAuth Providers**: Google, GitHub
- **Email Magic Links**: Passwordless authentication
- **Credentials**: Email/password login
- **Organizations**: Multi-tenant support
- **RBAC**: Role-based access control with custom roles
- **Audit Logs**: Comprehensive activity tracking

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Auth**: NextAuth.js v4 with Prisma Adapter
- **Database**: Prisma ORM (SQLite/PostgreSQL)
- **Email**: Nodemailer for transactional emails

### Data Models
- **User**: Authentication and profile data
- **Organization**: Multi-tenant workspaces
- **Membership**: User-organization relationships with roles
- **OrganizationRole**: Custom roles with permissions
- **AuditLog**: Activity and security events

### Role Hierarchy
| Role | Level | Permissions |
|------|-------|-------------|
| OWNER | 4 | All permissions |
| ADMIN | 3 | Users, org management, settings |
| MEMBER | 2 | Read access, basic settings |
| GUEST | 1 | Limited read access |

## Dependency Graph

```
root
├── packages/config/tsconfig
├── packages/config/eslint-config
├── apps/auth
│   ├── @auth/prisma-adapter
│   ├── next-auth
│   └── prisma
└── docs/
    └── shiki
```

## Technology Stack

- **Runtime**: Node.js 18+
- **Package Manager**: pnpm 8+
- **Language**: TypeScript 5.4+
- **Linting**: ESLint 8.57+
- **Code Style**: Prettier 3.2+
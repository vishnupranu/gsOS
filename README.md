# Monorepo Architecture Documentation

A pnpm monorepo demonstrating clean architecture patterns with shared configuration packages.

## Structure

```
├── apps/                 # Application packages
├── packages/             # Shared library packages
│   └── config/           # Configuration packages
│       ├── eslint-config/  # Shared ESLint config
│       └── tsconfig/       # Shared TypeScript configs
├── docs/                 # Documentation site
├── package.json          # Root package (private)
└── pnpm-workspace.yaml   # pnpm workspace configuration
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development mode (watch)
pnpm dev

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint
```

## Packages

### Configuration
- `@monorepo/tsconfig` - Base TypeScript configuration
- `@monorepo/eslint-config` - ESLint configuration with TypeScript support

### Applications
- `@monorepo/docs` - Documentation generator

## Adding a New Package

1. Create directory under `packages/` or `apps/`
2. Add `package.json` with appropriate scripts
3. Run `pnpm install` to update workspace

## Requirements

- Node.js 18+
- pnpm 8+
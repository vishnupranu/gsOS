# Project Structure

## Directory Layout

```
.
├── apps/                    # Application packages
│   └── (future apps)
├── packages/                # Shared library packages
│   └── config/              # Configuration packages
│       ├── eslint-config/   # ESLint configuration
│       └── tsconfig/        # TypeScript configurations
├── docs/                    # Documentation site
│   ├── src/                 # Source files
│   │   └── *.md            # Markdown documentation
│   ├── package.json
│   └── build.js             # Documentation builder
├── package.json             # Root package
├── pnpm-workspace.yaml      # pnpm workspace config
└── README.md                # This file
```

## Package Naming Convention

- **Apps**: `@monorepo/<app-name>`
- **Packages**: `@monorepo/<package-name>`
- **Config**: `@monorepo/<config-name>`

## Adding a New Package

1. Create the directory under `packages/` or `apps/`
2. Add a `package.json` with appropriate name and scripts
3. Add the package to `pnpm-workspace.yaml` if needed
4. Reference shared configs from `packages/config/`

## Adding Documentation

1. Create a `.md` file in `docs/src/`
2. Run `pnpm build` to generate HTML
3. Output appears in `docs/dist/`
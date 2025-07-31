# Technology Stack

## Core Framework
- **React 19** - Latest React with modern hooks and concurrent features
- **TypeScript** - Full type safety throughout the codebase
- **Vite** - Fast build tool with HMR for development

## UI & Styling
- **shadcn/ui** - Modern component library built on Radix UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Ant Design** - Additional UI components and design system
- **Vanilla Extract** - Type-safe CSS-in-JS
- **Styled Components** - Component styling solution
- **Lucide React** - Icon library
- **Iconify** - Additional icon system

## State Management & Data
- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management and caching
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

## Development Tools
- **Biome** - Fast linter and formatter (replaces ESLint/Prettier)
- **MSW (Mock Service Worker)** - API mocking for development
- **Faker.js** - Generate mock data
- **Lefthook** - Git hooks management
- **Commitlint** - Conventional commit message linting

## Build & Deployment
- **Node.js 20** - Runtime requirement
- **pnpm** - Package manager
- **Vercel** - Deployment platform with analytics

## Common Commands

### Development
```bash
pnpm dev          # Start development server on port 3001
pnpm build        # Build for production (TypeScript check + Vite build)
pnpm preview      # Preview production build locally
```

### Package Management
```bash
pnpm install      # Install dependencies (also runs lefthook install)
```

### Code Quality
- Biome handles both linting and formatting automatically
- Git hooks enforce commit message conventions
- TypeScript strict mode enabled with comprehensive checks

## Configuration Notes
- Uses path aliases: `@/*` for `src/*` and `#/*` for `src/types/*`
- Proxy setup for `/api` routes to `localhost:3000` in development
- Bundle analysis available in production builds
- Optimized chunk splitting for vendor libraries
# Project Structure

## Root Level Organization
```
├── src/                    # Main source code
├── public/                 # Static assets
├── .kiro/                  # Kiro AI assistant configuration
├── .cursor/                # Cursor IDE rules and configurations
├── node_modules/           # Dependencies
└── config files            # Build and tool configurations
```

## Source Code Structure (`src/`)

### Core Application
- `main.tsx` - Application entry point with router setup
- `App.tsx` - Root component with providers
- `global-config.ts` - Centralized configuration constants
- `global.css` - Global styles

### Feature Organization
```
src/
├── pages/                  # Route components organized by feature
│   ├── dashboard/         # Dashboard pages (analysis, workbench, jenkins)
│   ├── management/        # User/system management pages
│   ├── components/        # Component showcase pages
│   ├── functions/         # Utility function pages
│   ├── menu-level/        # Multi-level menu examples
│   └── sys/               # System pages (login, errors, etc.)
├── components/            # Reusable UI components
├── layouts/               # Layout components
├── routes/                # Routing configuration
└── api/                   # API layer
```

### Supporting Directories
- `_mock/` - MSW mock data and handlers
- `api/services/` - API service functions
- `assets/` - Static assets (icons, images)
- `hooks/` - Custom React hooks
- `locales/` - Internationalization files
- `store/` - Zustand state management
- `theme/` - Theme configuration and tokens
- `types/` - TypeScript type definitions
- `ui/` - shadcn/ui components
- `utils/` - Utility functions

## Naming Conventions

### Files & Directories
- Use kebab-case for directories: `menu-level/`, `multi-language/`
- Use kebab-case for component files: `nav-item.tsx`, `upload-box.tsx`
- Use camelCase for utility files: `apiClient.ts`, `userService.ts`
- Use PascalCase for component names in code

### Components
- Page components in `pages/` follow directory structure
- Reusable components in `components/` with index exports
- UI primitives in `ui/` following shadcn/ui conventions

## Import Path Aliases
- `@/*` - Maps to `src/*` for all source files
- `#/*` - Maps to `src/types/*` for type definitions

## Architecture Patterns

### API Layer
- Services in `api/services/` handle external API calls
- Mock handlers in `_mock/handlers/` for development
- Centralized API client configuration

### Component Structure
- Feature-based organization in `pages/`
- Shared components in `components/`
- UI primitives separated in `ui/`
- Each component directory includes index.ts for clean exports

### State Management
- Global state in `store/` using Zustand
- Server state managed by TanStack Query
- Local component state with React hooks

### Styling Approach
- Tailwind utility classes for styling
- Theme tokens in `theme/tokens/`
- Component-specific styles using Vanilla Extract when needed
- shadcn/ui components for consistent design system
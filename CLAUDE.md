# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev              # Start Next.js dev server on localhost:3000
npm run build            # Build for production
npm start               # Start production server
npm run lint            # Run ESLint
```

### Deployment
```bash
npm run predeploy       # Lint → Convex codegen → Convex deploy → Build
npm run deploy:local    # Run predeploy then start production server
```

### Convex
```bash
npx convex dev          # Start Convex dev environment (if needed separately)
npx convex codegen      # Regenerate TypeScript types from schema
npx convex deploy       # Deploy Convex functions to production
```

## Architecture Overview

This is a **Next.js 14 (App Router) + Convex** full-stack issue tracking application with real-time data synchronization.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Convex (serverless backend-as-a-service)
- **UI**: Tailwind CSS, Radix UI primitives, shadcn/ui components, lucide-react icons
- **State**: Convex reactive queries (no Redux/Zustand needed)
- **Export**: xlsx, file-saver

### Key Architecture Patterns

#### 1. Convex Data Flow
- Components use `useQuery()` hooks that automatically re-render when backend data changes
- Mutations via `useMutation()` hooks trigger real-time updates across all connected clients
- No manual refetching or state management needed for backend data
- Image uploads use Convex storage with `generateUploadUrl()` pattern

#### 2. Type System (`app/types.ts`)
- `MetaIssue` = Full Convex document with `_id`, `_creationTime`
- `ConvexIssue` = Partial without internal fields (API responses)
- `Issue` = Plain data object without Convex metadata

#### 3. Soft Delete Architecture
- Issues have `archived` and `deleted` boolean flags
- Main dashboard shows only active issues (`archived: false`)
- Archives page (`/admin/archives`) shows historical issues by date range
- Deletion is soft (`deleted: true`)

### Directory Structure

```
/app/                    # Next.js App Router pages
  - page.tsx             # Main dashboard (IssueForm + IssueList)
  - layout.tsx           # Root layout with theme support
  - IssueForm.tsx        # Create/edit issue form
  - IssueList.tsx        # List view with filtering, search, pagination
  - IssueDetail.tsx      # Edit modal for individual issues
  - types.ts             # TypeScript type definitions
  - data/issueOptions.ts # Static data (service numbers, clients, reasons)
  - admin/archives/      # Archives page route

/convex/                 # Backend schema and functions
  - schema.ts            # Database schema definition
  - issues.ts            # Queries and mutations
  - _generated/          # Auto-generated types (don't edit manually)

/components/             # Reusable UI components
  - Sidebar.tsx          # Global navigation
  - ArchivesPage.tsx     # Archives page component
  - ui/                  # shadcn/ui + custom components
    - SmartInput.tsx     # Autocomplete input component
    - ThemeToggle.tsx    # Dark/light mode toggle

/helpers/                # Utility functions
  - fileHelpers.ts       # Excel export functionality
  - objectHelpers.ts     # Object manipulation utilities

/hooks/                  # Custom React hooks
  - use-toast.ts         # Toast notification system
```

### Critical Patterns

#### Adding a New Field to Issues
1. Update schema in `/convex/schema.ts`
2. Run `npx convex codegen` to regenerate types
3. Update form in `/app/IssueForm.tsx`
4. Update display in `/app/IssueList.tsx` and `/app/IssueDetail.tsx`
5. Update mutations in `/convex/issues.ts` if needed

#### Convex Query/Mutation Pattern
```typescript
// Query (auto-updates on changes)
const issues = useQuery(api.issues.getIssues)
if (issues === undefined) return <div>Loading...</div>

// Mutation
const createIssue = useMutation(api.issues.createIssue)
await createIssue({ title: "...", ... })
```

#### Image Upload Flow
1. Call `generateUploadUrl()` mutation
2. POST file to returned URL
3. Receive `storageId`
4. Include `storageId` in issue creation
5. Convex automatically generates public URLs

#### Service # → Project Name Mapping
- Parallel arrays in `issueOptions.ts` (serviceNumbers, projectNames)
- Form auto-populates Project Name when Service # is selected
- Uses `serviceProjectMap` built from parallel arrays

### Filtering & Search
- Implemented client-side in `IssueList.tsx`
- Text search across: title, agent, language, reason, description, date
- Category dropdown filter
- Sort by date or service number
- Grouped display by category
- Category-based pagination (5 items per page)

### Theme Support
- Dark/light mode toggle in `ThemeToggle.tsx`
- Theme persisted in localStorage
- Preload script in layout prevents flash
- Tailwind configured with `darkMode: ["class"]`

### Export Functionality
- Category-specific Excel export via `helpers/fileHelpers.ts`
- Uses xlsx library to generate `.xlsx` files
- Formats dates properly (splits date/time into columns)
- Downloads via file-saver library

## Important Notes

- Always run `npx convex codegen` after modifying `/convex/schema.ts`
- Image URLs from Convex are configured in `next.config.mjs` remote patterns
- SmartInput component (`components/ui/SmartInput.tsx`) provides autocomplete for repeating values
- Toast notifications use custom hook (`hooks/use-toast.ts`)
- All Convex queries can return `undefined` during loading - always check before rendering

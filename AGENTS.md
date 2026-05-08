<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# TerraCRM — Agent Guidelines

## Project Overview
TerraCRM is a landscaping business CRM built with **Next.js 16 (App Router)**, **TypeScript**, **AWS DynamoDB**, and **AWS Cognito**. It uses a cyberpunk dark theme with CSS Modules.

## Architecture Rules

### File Organization
- **Pages**: `src/app/` using Next.js App Router conventions (`page.tsx`, `layout.tsx`)
- **API Routes**: `src/app/api/` (server-side, uses AWS SDK directly)
- **Shared Libraries**: `src/lib/` (auth utilities, DynamoDB client)
- **Styles**: CSS Modules (`.module.css`) colocated with their components

### Styling Conventions
- Use **CSS Modules** for all component styles — no TailwindCSS, no inline `<style>` tags
- Use **CSS Custom Properties** defined in `globals.css` for all colors, spacing, radii, shadows
- Never use hardcoded color values in components — always reference `var(--color-*)` tokens
- Shared modal styles are in `src/app/page.module.css` and imported as `globalStyles`
- Use the `.glass-surface` global utility class for frosted glass card effects

### Authentication
- Auth functions are in `src/lib/auth.ts` using `amazon-cognito-identity-js`
- The dashboard layout (`src/app/dashboard/layout.tsx`) acts as the auth guard
- Cognito env vars are prefixed with `NEXT_PUBLIC_` for client-side access
- DynamoDB env vars are server-only (no `NEXT_PUBLIC_` prefix)

### Database
- DynamoDB tables: `TerraCRM_Clients` and `TerraCRM_Jobs`
- Both use `id` (String) as the partition key, no sort key
- Document client is configured in `src/lib/aws.ts`
- API routes handle CRUD via `ScanCommand`, `PutCommand`, `UpdateCommand`

### Component Patterns
- All interactive dialogs use custom modals (never `window.alert`, `window.prompt`, or `window.confirm`)
- Forms use controlled React state, not `FormData`
- Drag-and-drop uses `@hello-pangea/dnd` (Draggable, Droppable, DragDropContext)
- Optimistic UI: update local state first, then sync with API

### Security
- `.env.local` is in `.gitignore` — never commit AWS credentials
- No setup scripts or credential files should exist in the repo
- All administrative AWS operations should be done manually via the AWS Console

## User Preferences
- **No browser native dialogs** — always use styled custom modals
- **Mobile-first** — all features must work on touch screens
- **No emojis in UI** — keep text clean to match the cyberpunk aesthetic
- **Full-width buttons on mobile** — headers stack vertically with stretched buttons
- **Scrollable containers** — all lists/tables must handle 100+ entries gracefully

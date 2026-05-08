@AGENTS.md

# Additional Context for Claude

## Quick Reference
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: CSS Modules + CSS Custom Properties in `globals.css`
- **Auth**: AWS Cognito via `amazon-cognito-identity-js` (client-side SRP auth)
- **Database**: AWS DynamoDB with 2 tables (`TerraCRM_Clients`, `TerraCRM_Jobs`)
- **Drag & Drop**: `@hello-pangea/dnd` for mobile-friendly Kanban board
- **Auth Guard**: `src/app/dashboard/layout.tsx` checks session on mount

## Key Files
- `src/lib/auth.ts` — signIn, signUp, confirmSignUp, signOut, forgotPassword, confirmForgotPassword
- `src/lib/aws.ts` — DynamoDB Document Client setup
- `src/app/api/clients/route.ts` — GET, POST, PATCH for clients
- `src/app/api/jobs/route.ts` — GET, POST, PATCH for jobs
- `src/app/globals.css` — All design tokens and global styles
- `src/app/page.module.css` — Shared modal component styles

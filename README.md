# 🌿 TerraCRM — Landscaping Business CRM

A modern, full-stack CRM (Customer Relationship Management) application built specifically for **landscaping businesses**. Manage clients, track jobs through a Kanban board, and stay on top of your business — all from a sleek cyberpunk-themed interface secured with AWS Cognito authentication.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![AWS](https://img.shields.io/badge/AWS-DynamoDB%20%2B%20Cognito-orange?logo=amazonaws)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [AWS Setup](#-aws-setup)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [Feature Documentation](#-feature-documentation)
- [API Reference](#-api-reference)
- [Design System](#-design-system)
- [Mobile Responsiveness](#-mobile-responsiveness)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 🔐 Authentication (AWS Cognito)
- **Sign In** — Email and password authentication via AWS Cognito User Pool
- **Sign Up** — Self-service account creation with email verification
- **Email Verification** — 6-digit code sent to email, auto-login after confirmation
- **Forgot Password** — Send a reset code to email, set a new password
- **Password Visibility Toggle** — Eye icon on all password fields to show/hide passwords
- **Route Protection** — Dashboard is fully guarded; unauthenticated users are redirected to `/login`
- **Sign Out** — Clears Cognito session and redirects to login page

### 👤 Client Management
- **Create Clients** — Add clients with name, address, phone number (with country code dropdown), and status
- **Edit Clients** — Click "Edit" on any client to modify all fields including status (Active/Inactive)
- **View Client Details** — Click a client name on a job card to see their full contact info
- **Click-to-Call** — Phone numbers are clickable `tel:` links for instant dialing on mobile
- **Click-to-Map** — Addresses open Google Maps with the location pre-filled
- **Scrollable Table** — Table has a fixed max-height with sticky column headers for handling 100+ entries
- **Full-Width Mobile Button** — "+ Add Client" stretches full-width on mobile screens

### 📋 Job Management (Kanban Board)
- **Drag-and-Drop Kanban** — Jobs are organized into 3 columns: **Leads**, **Scheduled**, **Completed**
- **Mobile-Friendly Drag** — Uses `@hello-pangea/dnd` for touch-friendly drag-and-drop on phones and tablets
- **Create Jobs** — Add jobs with title, linked client (dropdown), due date, and starting status
- **Edit Jobs** — Click "Edit" on any job card to update title, client, due date, or status
- **Client Linking** — Jobs are linked to existing clients via a searchable dropdown (no duplicate data)
- **Clickable Client Names** — Click a client's name on any job card to instantly view their contact details, call them, or navigate to their address
- **Due Dates** — Optional due date shown on cards in yellow (pending) or green (completed)
- **Created Date** — Auto-set when a job is created, displayed on each card
- **Scalable Columns** — Each column scrolls independently with a fixed viewport height — handles 100+ jobs
- **Optimistic UI** — Drag-and-drop updates the UI instantly, then syncs with DynamoDB in the background

### 📊 Dashboard Overview
- **Live Stats** — Active clients count, pending jobs count, completed jobs count
- **Recent Jobs** — Lists the 5 most recent jobs with status badges
- **Scrollable List** — Recent Jobs section scrolls with a max height of 400px

### 🎨 Design & UX
- **Cyberpunk Dark Theme** — Deep dark backgrounds with neon cyan and purple accents
- **Custom Scrollbars** — Slim 6px cyan scrollbar across the entire app
- **Glass Morphism** — Frosted glass card effects with backdrop blur
- **Animated Grid Background** — Subtle drifting grid pattern on the body
- **Smooth Transitions** — Hover effects, card lift animations, neon glow on focus
- **Custom Modals** — All create/edit/view actions use styled modals (no browser alerts)
- **Geist Font** — Modern sans-serif typography from Vercel

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | CSS Modules + CSS Custom Properties |
| **Database** | AWS DynamoDB (2 tables) |
| **Authentication** | AWS Cognito (User Pool + App Client) |
| **Auth SDK** | amazon-cognito-identity-js |
| **Drag & Drop** | @hello-pangea/dnd |
| **AWS SDK** | @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb |
| **Fonts** | Geist Sans, Geist Mono (via next/font) |

---

## 📁 Project Structure

```
landscape-crm/
├── public/
│   └── logo.png                          # TerraCRM logo (displayed in sidebar + login)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── clients/
│   │   │   │   └── route.ts              # GET, POST, PATCH for clients
│   │   │   └── jobs/
│   │   │       └── route.ts              # GET, POST, PATCH for jobs
│   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx              # Client table with CRUD modals
│   │   │   │   └── page.module.css       # Client page styles
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx              # Kanban board with drag-and-drop
│   │   │   │   └── page.module.css       # Kanban board styles
│   │   │   ├── layout.tsx                # Dashboard layout (sidebar, auth guard, logout)
│   │   │   ├── layout.module.css         # Dashboard layout styles
│   │   │   ├── page.tsx                  # Dashboard overview (stats + recent jobs)
│   │   │   └── page.module.css           # Dashboard overview styles
│   │   ├── login/
│   │   │   ├── page.tsx                  # Login/Signup/Verify/Reset Password
│   │   │   └── page.module.css           # Login page styles
│   │   ├── globals.css                   # Global design tokens, scrollbar, grid bg
│   │   ├── layout.tsx                    # Root HTML layout
│   │   ├── page.tsx                      # Landing page (public)
│   │   ├── page.module.css               # Landing + shared modal styles
│   │   └── icon.png                      # Favicon
│   └── lib/
│       ├── auth.ts                       # Cognito auth utilities (sign in/up/out, reset)
│       └── aws.ts                        # DynamoDB client configuration
├── .env.local                            # AWS credentials (NOT committed)
├── .gitignore
├── package.json
├── tsconfig.json
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

---

## 📦 Prerequisites

Before you start, make sure you have:

1. **Node.js 18+** — [Download here](https://nodejs.org/)
2. **npm** — Comes with Node.js
3. **AWS Account** — [Create one here](https://aws.amazon.com/)
4. **AWS CLI (optional)** — Useful for debugging, but not required

---

## ☁️ AWS Setup

You need to create **3 AWS resources** manually. All resources should be in the **same AWS region** (e.g., `us-east-1`).

### Step 1: Create DynamoDB Tables

Go to the [DynamoDB Console](https://console.aws.amazon.com/dynamodb) and create these 2 tables:

#### Table 1: `TerraCRM_Clients`
| Setting | Value |
|---------|-------|
| Table name | `TerraCRM_Clients` |
| Partition key | `id` (String) |
| Sort key | None |
| Table settings | Default (On-demand capacity recommended) |

#### Table 2: `TerraCRM_Jobs`
| Setting | Value |
|---------|-------|
| Table name | `TerraCRM_Jobs` |
| Partition key | `id` (String) |
| Sort key | None |
| Table settings | Default (On-demand capacity recommended) |

### Step 2: Create a Cognito User Pool

Go to the [Cognito Console](https://console.aws.amazon.com/cognito):

1. Click **"Create user pool"**
2. **Sign-in experience**:
   - Cognito user pool sign-in options: **Email**
3. **Security requirements**:
   - MFA: **No MFA** (or your preference)
   - Password policy: Minimum 8 characters, require uppercase, number
4. **Sign-up experience**:
   - Self-registration: **Enabled**
   - Cognito-assisted verification: **Email**
5. **Messaging**:
   - Email provider: **Send email with Cognito** (for development)
6. **App integration**:
   - User pool name: `TerraCRM-UserPool` (or any name)
   - App client name: `TerraCRM-Web`
   - Authentication flows: Enable **ALLOW_USER_SRP_AUTH**, **ALLOW_USER_PASSWORD_AUTH**, and **ALLOW_REFRESH_TOKEN_AUTH**
   - Client secret: **Don't generate** (public web client)
7. Click **Create user pool**

After creation, note down:
- **User Pool ID** (e.g., `us-east-1_aBcDeFgHi`)
- **App Client ID** (e.g., `5ghgsuievips2n8k0m4ssbg2d5`)

### Step 3: Create an IAM User for the App

Go to [IAM Console](https://console.aws.amazon.com/iam):

1. Create a new user (e.g., `terracrm-app`)
2. Attach the following policies:
   - `AmazonDynamoDBFullAccess` (or a scoped policy for just the 2 tables)
3. Create an **Access Key** (for programmatic access)
4. Note down the **Access Key ID** and **Secret Access Key**

> ⚠️ **Security Note:** For production, create a scoped IAM policy that only allows access to the `TerraCRM_Clients` and `TerraCRM_Jobs` tables instead of full DynamoDB access.

---

## 💻 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/landscape-crm.git
cd landscape-crm
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env.local` file in the project root:

```bash
touch .env.local
```

Add the following variables (replace with your actual values):

```env
# AWS DynamoDB Credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# AWS Cognito (must be prefixed with NEXT_PUBLIC_ for client-side access)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_aBcDeFgHi
NEXT_PUBLIC_COGNITO_CLIENT_ID=5ghgsuievips2n8k0m4ssbg2d5
NEXT_PUBLIC_AWS_REGION=us-east-1
```

> ⚠️ **NEVER commit `.env.local` to version control.** It is already listed in `.gitignore`.

---

## 🚀 Running the App

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 📖 Feature Documentation

### Authentication Flow

1. **First Visit** → User lands on the public landing page (`/`)
2. **Click "Get Started"** → Redirected to `/login`
3. **Sign Up** → Click "Sign Up", enter email + password → AWS sends a 6-digit verification code
4. **Verify Email** → Enter the code → Account is confirmed, user is auto-logged in
5. **Dashboard Access** → User is redirected to `/dashboard`
6. **Subsequent Visits** → If the Cognito session is still valid (stored in localStorage), the user goes directly to the dashboard
7. **Session Expired** → User is redirected to `/login`
8. **Forgot Password** → Click "Forgot Password?" → Enter email → Receive reset code → Enter code + new password → Auto-login

### Client Data Model

Each client record in DynamoDB (`TerraCRM_Clients`) has:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Auto-generated (e.g., `C-8173`) |
| `name` | String | Client's full name |
| `address` | String | Street address |
| `phone` | String | Phone with country code (e.g., `+1 5551234567`) |
| `status` | String | `Active` or `Inactive` |
| `createdAt` | String | ISO 8601 timestamp |

### Job Data Model

Each job record in DynamoDB (`TerraCRM_Jobs`) has:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Auto-generated (e.g., `J-0042`) |
| `title` | String | Job name (e.g., "Front Yard Landscaping") |
| `client` | String | Client name (linked via dropdown) |
| `date` | String | Created date display string (e.g., "May 8") |
| `dueDate` | String | Due date in `YYYY-MM-DD` format (optional) |
| `status` | String | `Lead`, `Scheduled`, or `Completed` |
| `createdAt` | String | ISO 8601 timestamp |

### Kanban Board Workflow

```
┌──────────┐     Drag →     ┌──────────────┐     Drag →     ┌──────────────┐
│  LEADS   │  ────────────▶ │  SCHEDULED   │  ────────────▶ │  COMPLETED   │
│          │                │              │                │              │
│ New jobs │                │ Confirmed    │                │ Done jobs    │
│ incoming │  ◀──────────── │ work dates   │  ◀──────────── │ archived     │
└──────────┘     ← Drag     └──────────────┘     ← Drag     └──────────────┘
```

- Jobs can be dragged **in any direction** between columns
- The status is updated in DynamoDB immediately after each drop
- If the API call fails, the board reverts by re-fetching from the database

---

## 🔌 API Reference

### Clients API (`/api/clients`)

#### `GET /api/clients`
Returns all clients from DynamoDB.

**Response:**
```json
{
  "clients": [
    {
      "id": "C-8173",
      "name": "John Doe",
      "address": "123 Main St",
      "phone": "+1 5551234567",
      "status": "Active",
      "createdAt": "2026-05-08T20:00:00.000Z"
    }
  ]
}
```

#### `POST /api/clients`
Creates a new client.

**Request Body:**
```json
{
  "name": "John Doe",
  "address": "123 Main St",
  "phone": "+1 5551234567",
  "status": "Active"
}
```

#### `PATCH /api/clients`
Updates an existing client.

**Request Body:**
```json
{
  "id": "C-8173",
  "name": "John Doe Updated",
  "address": "456 Oak Ave",
  "phone": "+1 5559876543",
  "status": "Inactive"
}
```

---

### Jobs API (`/api/jobs`)

#### `GET /api/jobs`
Returns all jobs from DynamoDB.

#### `POST /api/jobs`
Creates a new job.

**Request Body:**
```json
{
  "title": "Front Yard Landscaping",
  "client": "John Doe",
  "dueDate": "2026-05-15",
  "status": "Lead"
}
```

#### `PATCH /api/jobs`
Updates an existing job. All fields are optional except `id`.

**Request Body:**
```json
{
  "id": "J-0042",
  "title": "Updated Title",
  "client": "Jane Smith",
  "dueDate": "2026-06-01",
  "status": "Scheduled"
}
```

---

## 🎨 Design System

### CSS Custom Properties (defined in `globals.css`)

```css
/* Colors */
--color-background: #090914     /* Deep dark background */
--color-surface: #131320        /* Card/panel background */
--color-primary: #00d9e6        /* Neon cyan */
--color-secondary: #d633ff      /* Neon purple */
--color-success: #20d866        /* Green */
--color-warning: #eebb22        /* Yellow/amber */
--color-danger: #e62244         /* Red */

/* Typography */
--font-family-sans: Geist Sans
--font-family-mono: Geist Mono

/* Spacing Scale */
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem

/* Border Radius */
--radius-sm: 2px
--radius-md: 6px
--radius-lg: 12px
--radius-xl: 16px
```

### Component Patterns

- **Glass Surface**: Use `className="glass-surface"` for frosted glass card effect
- **Modal System**: All modals use classes from `page.module.css` (`.modalOverlay`, `.modalContent`, `.modalTitle`, `.modalInput`, `.modalActions`)
- **Buttons**: Primary buttons use `.button` class, cancel uses `.modalBtnCancel`

---

## 📱 Mobile Responsiveness

The app is fully responsive across all breakpoints:

| Breakpoint | Layout Changes |
|------------|---------------|
| **> 900px** | 3-column Kanban, sidebar visible, full table |
| **768px - 900px** | Single-column Kanban, stacked headers |
| **< 768px** | Hidden sidebar (hamburger menu), full-width buttons, compact table cells |

### Mobile-Specific Features
- **Touch Drag-and-Drop** — Jobs can be dragged between columns on touch screens
- **Hamburger Menu** — Sidebar collapses into a slide-out menu
- **Click-to-Call** — Phone numbers trigger the native phone dialer
- **Click-to-Map** — Addresses open in the native maps app

---

## 🔧 Troubleshooting

### "USER_SRP_AUTH is not enabled for the client"
Your Cognito App Client doesn't have SRP auth enabled. Go to Cognito Console → User Pool → App Integration → App Client → Edit → Enable **ALLOW_USER_SRP_AUTH**.

### "Failed to fetch jobs/clients"
- Check that your `.env.local` has the correct AWS credentials
- Verify the DynamoDB table names match exactly: `TerraCRM_Clients` and `TerraCRM_Jobs`
- Ensure your IAM user has DynamoDB permissions

### "Redirected to login after refresh"
Your Cognito session may have expired. Sign in again. Sessions are stored in the browser's localStorage.

### Drag-and-drop not working on mobile
- Make sure you're using a Chromium-based browser (Chrome, Edge) or Safari
- The drag requires a **long press** to initiate on touch screens

### Page shifts when switching tabs
The layout uses `overflow-y: scroll` to always show the scrollbar and prevent layout shift.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ for landscaping businesses by TerraCRM.

Implementation Plan - Eventful Frontend
Overview
Build the Eventful frontend, a Next.js 14 application providing a seamless experience for event creators and attendees. The project utilizes TypeScript, Tailwind CSS v4, and shadcn/ui v3. It integrates with a NestJS backend for authentication, event management, and payment processing via Paystack.

Design Breakdown
1. Visual Language & Theme
Theme: Premium, modern, and high-contrast.
Colors:
Primary: #7c3aed (Purple) - Used for buttons, active states, and highlights.
Secondary: #fb923c (Orange) - Accents.
Background: #f8f9ff (Off-white/Blue tint).
Surface: #ffffff (White cards).
Typography: Geist (Modern Sans) for UI, JetBrains Mono for data/codes.
Radius: 12px (Standard) for cards and inputs.
2. Layouts
Public/Eventee Layout: Centered content with a clean top Navbar and Footer.
Dashboard Layout: Fixed Sidebar for navigation, Scrollable content area, and a Header for notifications/profile.
Technical Architecture
1. Tech Stack
Framework: Next.js 14 (App Router).
Styling: Tailwind CSS v4.
UI Components: shadcn/ui v3.
State Management: Zustand (Persistent Auth state).
Data Fetching: TanStack Query v5 + Axios (with JWT interceptors).
Validation: React Hook Form + Zod.
QR Utilities: ‭@yudiel/react-qr-scanner‬, react-qr-code.
Charts: Recharts (Area/Bar).
2. Module Organization
‭src/app‬: File-based routing and page layouts.
‭src/components‬:
‭ui/‬: shadcn primitives.
‭layout/‬: Navbar, Sidebar, Dashboard shell.
‭features/‬: Specific logic for Events, Tickets, Analytics.
‭src/lib‬:
‭api/‬: Axios client and endpoint definitions.
‭store/‬: Zustand auth store.
‭hooks/‬: TanStack Query hooks.
‭schemas/‬: Zod validation schemas.
‭src/types‬: TypeScript interfaces shared with backend.
Step-by-Step Implementation
Phase 1: Setup & Core Infrastructure
Initialize Project: Create Next.js app in ‭frontend/‬ folder.
Configuration:
Set up Tailwind v4 (@theme in global CSS).
Initialize shadcn v3.
Configure .env.local for backend URL and Paystack key.
Core Libs:
Implement ‭api/axios.ts‬ with 401 refresh logic.
Set up auth.store.ts for persistence.
Create TanStack Query provider and wrap root layout.
Phase 2: Authentication & Routing
Auth Pages: Implement ‭(auth)/register‬ and ‭(auth)/login‬ with role selection.
Protection: Implement middleware.ts to redirect users based on accessToken and userRole.
Identity: Connect auth forms to backend and update Zustand/Cookies on success.
Phase 3: Eventee Experience
Landing Page: Build the high-fidelity hero section and featured events grid.
Explore Page: Implement sidebar filters and search functionality.
Public Detail: Build the individual event page with ticket selection.
Checkout & Payment:
Integrate Paystack initialization.
Implement ‭/payment/verify‬ callback page.
My Tickets: Implement ticket list and individual QR display pages.
Phase 4: Creator Experience
Dashboard: Build summary cards with sparklines and the "Upcoming Events" table.
Event Creation: Implement the multi-step form with dynamic ticket tiers and banner uploads.
Analytics: Build the analytics dashboard with Recharts visualizations.
QR Scanner: Implement the scanner page for real-time ticket validation.
Phase 5: Polish & Fidelity
Theming: Refine all colors and spacing to match Figma exactly.
Animations: Add Framer Motion transitions for modals and page entries.
Responsiveness: Ensure scanner is mobile-perfect and dashboards are usable on tablets.
Definition of Done (DoD)
 Application initialized with Next.js 14, Tailwind v4, and shadcn.
 Persistent role-based authentication is functional.
 End-to-end event discovery and ticket purchase flow works.
 Creator dashboard shows accurate data and handles event creation.
 QR scanner correctly validates tickets via backend.
 UI matches Figma designs with high fidelity.
To-dos (5)
 Initialize project: Create Next.js app in frontend/, setup Tailwind v4 and shadcn v3
 Core infrastructure: Implement Axios client, Zustand store, and TanStack Query hooks
 Authentication: Implement Register/Login pages and route protection middleware
 Eventee features: Build Landing, Explore, Checkout, and Ticket pages
 Creator features: Build Dashboard, Event Form, Analytics, and QR Scanner

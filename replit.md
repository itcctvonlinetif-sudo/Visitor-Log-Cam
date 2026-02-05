# Visitor Management System

## Overview

A full-stack visitor management system (Sistem Keluar Masuk) built for tracking visitor check-ins and check-outs. The application supports RFID card scanning, QR code scanning, webcam photo capture, and data export/import functionality. The interface is in Indonesian, targeting office or facility visitor tracking use cases.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion for page transitions and UI feedback
- **Build Tool**: Vite with HMR support

The frontend follows a pages-based structure under `client/src/pages/` with reusable components in `client/src/components/`. Custom hooks in `client/src/hooks/` handle data fetching (`use-visits.ts`) and UI state (`use-toast.ts`, `use-mobile.tsx`).

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod with drizzle-zod integration
- **API Pattern**: REST endpoints defined in `server/routes.ts`

The server uses a storage abstraction layer (`server/storage.ts`) implementing the `IStorage` interface, allowing for potential database swapping. Routes are registered through a centralized function in `server/routes.ts`.

### Shared Code
- **Location**: `shared/` directory
- **Schema**: Database schema and Zod validation schemas in `shared/schema.ts`
- **API Contracts**: Route definitions with type-safe request/response schemas in `shared/routes.ts`

### Data Model
The core entity is `visits` with fields for:
- Visitor information (name, phone, address, photo)
- RFID card association
- Meeting details (who they're meeting, purpose)
- Check-in/check-out timestamps and status

### Build System
- **Development**: Vite dev server with Express backend (HMR enabled)
- **Production**: Custom build script using esbuild for server bundling and Vite for client
- **Database Migrations**: Drizzle Kit for schema push (`npm run db:push`)

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Database queries and migrations
- **connect-pg-simple**: PostgreSQL session storage (available but session auth not fully implemented)

### UI Libraries
- **shadcn/ui**: Complete component library (Radix primitives with Tailwind styling)
- **Lucide React**: Icon library
- **react-webcam**: Camera capture for visitor photos
- **qrcode.react**: QR code generation for visitor passes
- **embla-carousel-react**: Carousel component

### Form & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Zod resolver for form validation
- **zod**: Runtime type validation

### Date Handling
- **date-fns**: Date formatting and manipulation (with Indonesian locale support)

### Fonts
- Google Fonts: Outfit (display), Inter (body), DM Sans, Fira Code, Geist Mono
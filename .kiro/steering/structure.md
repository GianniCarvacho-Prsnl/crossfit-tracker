# Project Structure

## Directory Organization

```
crossfit-tracker/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with navigation
│   ├── page.tsx                 # Dashboard/home page
│   ├── login/
│   │   └── page.tsx            # Authentication page
│   ├── register/
│   │   └── page.tsx            # New workout registration
│   ├── records/
│   │   └── page.tsx            # View workout history
│   ├── conversions/
│   │   └── page.tsx            # Weight conversion mockup
│   ├── percentages/
│   │   └── page.tsx            # RM percentage mockup
│   └── auth/
│       └── confirm/
│           └── route.ts        # Email confirmation handler
├── components/                   # Reusable React components
│   ├── auth/
│   │   ├── AuthComponent.tsx   # Login/logout functionality
│   │   └── ProtectedRoute.tsx  # Route protection wrapper
│   ├── forms/
│   │   └── WorkoutForm.tsx     # Workout registration form
│   ├── lists/
│   │   └── RecordsList.tsx     # Workout records display
│   ├── navigation/
│   │   └── Navigation.tsx      # Mobile navigation menu
│   └── ui/                     # Generic UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Select.tsx
├── utils/                        # Utility functions
│   ├── supabase/
│   │   ├── client.ts           # Supabase client config
│   │   └── server.ts           # Server-side Supabase
│   ├── calculations.ts          # 1RM and weight calculations
│   ├── conversions.ts          # Unit conversion functions
│   └── formatting.ts           # Data formatting helpers
├── types/                        # TypeScript type definitions
│   ├── database.ts             # Supabase generated types
│   └── workout.ts              # Workout-specific types
├── __tests__/                    # Test files
│   ├── utils/
│   ├── components/
│   └── e2e/
├── public/                       # Static assets
├── .kiro/                        # Kiro configuration
│   ├── steering/               # AI assistant guidance
│   └── specs/                  # Project specifications
└── config files                 # Next.js, Tailwind, etc.
```

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `WorkoutForm.tsx`)
- **Pages**: lowercase (e.g., `page.tsx`, `layout.tsx`)
- **Utilities**: camelCase (e.g., `calculations.ts`)
- **Types**: camelCase with descriptive names (e.g., `workout.ts`)

### Component Structure
- Each component in its own file
- Co-locate related components in feature folders
- Export default for main component, named exports for utilities

### Import Organization
```typescript
// External libraries
import React from 'react'
import { NextPage } from 'next'

// Internal utilities
import { calculateOneRM } from '@/utils/calculations'
import { supabase } from '@/utils/supabase/client'

// Components
import WorkoutForm from '@/components/forms/WorkoutForm'

// Types
import type { WorkoutRecord } from '@/types/workout'
```

### Database Schema Alignment
- Table names: snake_case (e.g., `workout_records`)
- TypeScript interfaces: PascalCase (e.g., `WorkoutRecord`)
- Database fields map to camelCase in TypeScript

### Mobile-First Approach
- All components designed for mobile first
- Responsive breakpoints: `sm:`, `md:`, `lg:` for larger screens
- Touch-friendly UI elements (minimum 44px touch targets)

### State Management
- React hooks for local state
- Supabase real-time subscriptions for data sync
- No external state management library (Redux, Zustand) for MVP
# Technology Stack

## Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS (mobile-first responsive design)
- **UI Library**: React 18
- **PWA**: next-pwa for progressive web app capabilities

## Backend & Database
- **BaaS**: Supabase (PostgreSQL + Auth + API)
- **Authentication**: Supabase Auth with email/password
- **Security**: Row Level Security (RLS) policies
- **MCP Integration**: @supabase/mcp-server-supabase for database management

## Development Tools
- **Package Manager**: npm/yarn
- **Linting**: ESLint + Prettier
- **Testing**: Jest (unit), Cypress (E2E)
- **Type Safety**: TypeScript strict mode

## Key Libraries
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side rendering support
- `next-pwa` - Progressive Web App functionality

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Cypress E2E tests
npm run test:coverage # Generate coverage report
```

### Database (via Supabase CLI or MCP)
```bash
# Using Supabase CLI
supabase db reset    # Reset local database
supabase db push     # Push schema changes
supabase gen types typescript --local # Generate TypeScript types

# Using MCP (configured in mcp.json)
# Database operations handled through MCP tools
```

## Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_ACCESS_TOKEN=your_personal_access_token # For MCP
```

## Deployment
- **Platform**: Vercel (recommended for Next.js)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
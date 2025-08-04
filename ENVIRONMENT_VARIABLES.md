# Environment Variables Documentation

This document describes all environment variables used by CrossFit Tracker.

## Required Variables

These variables must be set for the application to function properly:

### NEXT_PUBLIC_SUPABASE_URL
- **Description**: Supabase project URL
- **Required**: Yes
- **Example**: See .env.local.example

### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Description**: Supabase anonymous key
- **Required**: Yes
- **Example**: See .env.local.example

## Optional Variables

These variables are optional but may enhance functionality:

### SUPABASE_ACCESS_TOKEN
- **Description**: Supabase personal access token (for MCP integration)
- **Required**: No
- **Example**: See .env.local.example

### NODE_ENV
- **Description**: Node.js environment
- **Required**: No
- **Example**: See .env.local.example

## Production Variables

Additional variables recommended for production:

### NEXT_PUBLIC_VERCEL_ANALYTICS_ID
- **Description**: Vercel Analytics ID (recommended for production)
- **Required**: No (recommended)
- **Example**: See .env.production.example

## Setup Instructions

1. Copy `.env.local.example` to `.env.local`
2. Fill in your actual values
3. For production, copy `.env.production.example` to `.env.production.local`
4. Configure the same variables in your deployment platform (Vercel)

## Verification

Run `npm run pre-deploy:env` to verify all environment variables are properly configured.

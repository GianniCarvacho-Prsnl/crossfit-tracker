import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Default loading component
const DefaultLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

/**
 * Utility for creating dynamically imported components with loading states
 */
export function createDynamicComponent<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options?: {
    loading?: () => JSX.Element;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || DefaultLoader,
    ssr: options?.ssr ?? true,
  });
}

// Pre-configured dynamic imports for common components
export const DynamicRecordsList = createDynamicComponent(
  () => import('@/components/lists/RecordsList'),
  { ssr: false } // Records list doesn't need SSR as it loads user data
);

export const DynamicWorkoutForm = createDynamicComponent(
  () => import('@/components/forms/WorkoutForm'),
  { ssr: false } // Form doesn't need SSR
);

// Dynamic import for navigation component (for better initial load)
export const DynamicNavigation = createDynamicComponent(
  () => import('@/components/navigation/Navigation'),
  { 
    ssr: true, // Navigation should be SSR for better UX
    loading: () => (
      <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
      </div>
    )
  }
);

// Dynamic import for auth component (only load when needed)
export const DynamicAuthComponent = createDynamicComponent(
  () => import('@/components/auth/AuthComponent'),
  { ssr: false }
);

// Loading component for heavy components
export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Cargando...</span>
  </div>
);

// Lightweight loading component for smaller components
export const LightLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);
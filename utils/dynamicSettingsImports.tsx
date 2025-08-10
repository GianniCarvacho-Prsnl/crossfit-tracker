'use client'

import React, { lazy, Suspense } from 'react'
import type { SettingsSection } from '@/types/settings'

// Lazy load settings sections for better performance
const ProfileSection = lazy(() => import('@/components/settings/sections/ProfileSection'))
const PersonalDataSection = lazy(() => import('@/components/settings/sections/PersonalDataSection'))
const ExerciseManagementSection = lazy(() => import('@/components/settings/sections/ExerciseManagementSection'))
const AppPreferencesSection = lazy(() => import('@/components/settings/sections/AppPreferencesSection'))
const SecuritySection = lazy(() => import('@/components/settings/sections/SecuritySection'))
const TrainingSection = lazy(() => import('@/components/settings/sections/TrainingSection'))

// Loading component for sections
const SectionLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-sm text-gray-600">Cargando sección...</span>
  </div>
)

// Props interface for sections
interface SectionProps {
  user: any
  tempFormData?: Record<string, any>
  updateTempFormData?: (key: string, value: any) => void
  saveTempChanges?: () => void
  discardTempChanges?: () => void
  hasUnsavedChanges?: boolean
}

// Lazy section wrapper with error boundary
const LazySection: React.FC<{
  section: SettingsSection
  props: SectionProps
}> = ({ section, props }) => {
  // Ensure all required props have default values
  const sectionProps = {
    ...props,
    tempFormData: props.tempFormData || {},
    updateTempFormData: props.updateTempFormData || (() => {}),
    saveTempChanges: props.saveTempChanges || (() => {}),
    discardTempChanges: props.discardTempChanges || (() => {}),
    hasUnsavedChanges: props.hasUnsavedChanges || false
  }

  const getSectionComponent = () => {
    switch (section) {
      case 'profile':
        return <ProfileSection {...sectionProps} />
      case 'personal-data':
        return <PersonalDataSection {...sectionProps} />
      case 'exercise-management':
        return <ExerciseManagementSection {...sectionProps} />
      case 'app-preferences':
        return <AppPreferencesSection {...sectionProps} />
      case 'security':
        return <SecuritySection {...sectionProps} />
      case 'training':
        return <TrainingSection {...sectionProps} />
      default:
        return <div className="text-center py-8 text-gray-500">Sección no encontrada</div>
    }
  }

  return (
    <Suspense fallback={<SectionLoadingSpinner />}>
      <ErrorBoundary section={section}>
        {getSectionComponent()}
      </ErrorBoundary>
    </Suspense>
  )
}

// Error boundary for lazy loaded sections
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; section: SettingsSection },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; section: SettingsSection }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in settings section ${this.props.section}:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm font-medium">Error al cargar la sección</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default LazySection
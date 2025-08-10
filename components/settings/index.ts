// Settings components exports
export { default as UserSettingsMenu } from './UserSettingsMenu'
export { default as UserSettingsModal } from './UserSettingsModal'

// Shared components
export { default as SettingsCard } from './shared/SettingsCard'
export { default as SettingsToggle } from './shared/SettingsToggle'
export { default as SettingsButton } from './shared/SettingsButton'
export { default as MemoizedSettingsCard } from './shared/MemoizedSettingsCard'

// Section components (lazy loaded)
export { default as ProfileSection } from './sections/ProfileSection'
export { default as PersonalDataSection } from './sections/PersonalDataSection'
export { default as ExerciseManagementSection } from './sections/ExerciseManagementSection'
export { default as AppPreferencesSection } from './sections/AppPreferencesSection'
export { default as SecuritySection } from './sections/SecuritySection'
export { default as TrainingSection } from './sections/TrainingSection'

// Utilities
export { default as LazySection } from '@/utils/dynamicSettingsImports'
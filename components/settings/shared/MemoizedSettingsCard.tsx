'use client'

import React, { memo } from 'react'
import SettingsCard from './SettingsCard'

interface MemoizedSettingsCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  // Add dependency props for memoization control
  dependencies?: any[]
}

const MemoizedSettingsCard: React.FC<MemoizedSettingsCardProps> = memo(({
  title,
  description,
  children,
  className,
  dependencies = []
}) => {
  return (
    <SettingsCard
      title={title}
      description={description}
      className={className}
    >
      {children}
    </SettingsCard>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization control
  if (prevProps.title !== nextProps.title) return false
  if (prevProps.description !== nextProps.description) return false
  if (prevProps.className !== nextProps.className) return false
  
  // Compare dependencies array
  if (prevProps.dependencies?.length !== nextProps.dependencies?.length) return false
  
  for (let i = 0; i < (prevProps.dependencies?.length || 0); i++) {
    if (prevProps.dependencies?.[i] !== nextProps.dependencies?.[i]) return false
  }
  
  return true
})

MemoizedSettingsCard.displayName = 'MemoizedSettingsCard'

export default MemoizedSettingsCard
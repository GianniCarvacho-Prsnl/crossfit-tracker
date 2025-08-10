'use client'

import React from 'react'
import { SettingsCardProps } from '@/types/settings'

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  const titleId = React.useId()
  const descriptionId = React.useId()

  return (
    <section 
      className={`bg-white rounded-lg border border-gray-200 p-4 mb-4 ${className}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className="mb-3">
        <h3 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p id={descriptionId} className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  )
}

export default SettingsCard
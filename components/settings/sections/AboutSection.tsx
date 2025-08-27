'use client'

import React from 'react'
import VersionDisplay from '@/components/ui/VersionDisplay'
import appVersion from '@/app-version.json'

interface AboutSectionProps {
  onClose?: () => void
}

export default function AboutSection({ onClose }: AboutSectionProps) {
  return (
    <div className="space-y-6" data-testid="about-section">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🏋️</span>
        </div>
        <h2 className="text-responsive-xl font-bold text-gray-900 mb-2">
          CrossFit Tracker
        </h2>
        <p className="text-responsive-sm text-gray-600">
          Tu compañero de entrenamiento personal
        </p>
      </div>

      {/* Version Badge */}
      <div className="text-center">
        <VersionDisplay variant="badge" />
      </div>

      {/* App Information */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Información de la Versión</h3>
          <div className="grid grid-cols-2 gap-4 text-responsive-sm">
            <div>
              <span className="font-medium text-gray-700">Versión:</span>
              <p className="text-gray-600">v{appVersion.version}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha:</span>
              <p className="text-gray-600">{appVersion.buildDate}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Funcionalidades Principales</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-responsive-sm">
            {appVersion.features.map((feature, index) => (
              <div key={index} className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Changes */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Novedades en v{appVersion.version}
        </h3>
        <div className="space-y-3">
          {(() => {
            const currentVersion = appVersion.changelog[appVersion.version as keyof typeof appVersion.changelog]
            if (!currentVersion) return null
            
            return (
              <>
                {currentVersion.added && (
                  <div>
                    <h4 className="font-medium text-green-700 text-responsive-sm mb-2">
                      Nuevas funcionalidades:
                    </h4>
                    <ul className="space-y-1 text-responsive-sm text-gray-600">
                      {currentVersion.added.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-0.5">+</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {'improved' in currentVersion && currentVersion.improved && (
                  <div>
                    <h4 className="font-medium text-blue-700 text-responsive-sm mb-2">
                      Mejoras:
                    </h4>
                    <ul className="space-y-1 text-responsive-sm text-gray-600">
                      {currentVersion.improved.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2 mt-0.5">↗</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center pt-4 border-t">
        <p className="text-responsive-xs text-gray-500">
          © 2025 CrossFit Tracker. Desarrollado con ❤️ para atletas.
        </p>
      </div>
    </div>
  )
}

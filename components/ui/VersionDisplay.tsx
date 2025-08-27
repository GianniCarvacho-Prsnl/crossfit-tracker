'use client'

import { useState } from 'react'
import appVersion from '@/app-version.json'

interface VersionDisplayProps {
  variant?: 'badge' | 'footer' | 'modal'
  showDetails?: boolean
}

export default function VersionDisplay({ 
  variant = 'badge', 
  showDetails = false 
}: VersionDisplayProps) {
  const [showModal, setShowModal] = useState(false)

  const handleVersionClick = () => {
    if (variant === 'badge' || variant === 'footer') {
      setShowModal(true)
    }
  }

  const renderBadge = () => (
    <button
      onClick={handleVersionClick}
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
      title="Información de la versión"
      data-testid="version-badge"
    >
      v{appVersion.version}
    </button>
  )

  const renderFooter = () => (
    <button
      onClick={handleVersionClick}
      className="text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      title="Información de la versión"
      data-testid="version-footer"
    >
      CrossFit Tracker v{appVersion.version}
    </button>
  )

  const renderModal = () => (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      data-testid="version-modal"
    >
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={() => setShowModal(false)}
        />

        {/* Modal Panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <span className="text-lg">ℹ️</span>
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-responsive-lg font-semibold leading-6 text-gray-900 mb-4">
                  Información de la Aplicación
                </h3>
                
                <div className="space-y-4">
                  {/* Versión actual */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Versión Actual</h4>
                    <p className="text-responsive-sm text-gray-600">
                      v{appVersion.version} - {appVersion.buildDate}
                    </p>
                  </div>

                  {/* Características */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Funcionalidades</h4>
                    <ul className="text-responsive-sm text-gray-600 space-y-1">
                      {appVersion.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Últimos cambios */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Últimos Cambios (v{appVersion.version})</h4>
                    <div className="text-responsive-sm text-gray-600 space-y-2">
                      {(() => {
                        const currentVersion = appVersion.changelog[appVersion.version as keyof typeof appVersion.changelog]
                        if (!currentVersion) return null
                        
                        return (
                          <>
                            {currentVersion.added && (
                              <div>
                                <span className="font-medium text-green-700">Nuevas funcionalidades:</span>
                                <ul className="ml-4 mt-1 space-y-1">
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
                                <span className="font-medium text-blue-700">Mejoras:</span>
                                <ul className="ml-4 mt-1 space-y-1">
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
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="min-h-touch w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-responsive-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {variant === 'badge' && renderBadge()}
      {variant === 'footer' && renderFooter()}
      {variant === 'modal' && showDetails && renderModal()}
      {showModal && renderModal()}
    </>
  )
}

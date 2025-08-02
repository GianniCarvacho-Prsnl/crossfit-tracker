'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthComponent from '@/components/auth/AuthComponent'

export default function LoginContent() {
  const searchParams = useSearchParams()
  const [initialError, setInitialError] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'confirmation_failed') {
      setInitialError('Error al confirmar el email. Intenta registrarte nuevamente.')
    }
  }, [searchParams])

  return (
    <div>
      {initialError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm text-center">
          {initialError}
        </div>
      )}
      <AuthComponent mode="login" />
    </div>
  )
}
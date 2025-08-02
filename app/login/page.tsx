'use client'

import { Suspense } from 'react'
import AuthComponent from '@/components/auth/AuthComponent'
import LoginContent from './LoginContent'

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthComponent mode="login" />}>
      <LoginContent />
    </Suspense>
  )
}
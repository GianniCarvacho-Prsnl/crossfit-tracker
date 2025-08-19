'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Navigation from '@/components/navigation/Navigation'
import Footer from '@/components/Footer'
import FeedbackModal from '@/components/feedback/FeedbackModal'
import { useFeedback } from '@/components/feedback/FeedbackProvider'

interface LayoutContentProps {
  children: React.ReactNode
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname()
  const { isModalOpen, closeModal } = useFeedback()
  
  // Don't show footer on login page
  const shouldShowFooter = pathname !== '/login'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      {shouldShowFooter && <Footer />}
      <FeedbackModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  )
}
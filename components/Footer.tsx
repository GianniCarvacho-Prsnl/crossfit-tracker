'use client'

import React from 'react'
import FeedbackTrigger from './feedback/FeedbackTrigger'

interface FooterProps {
  className?: string
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer 
      className={`sticky bottom-0 bg-white border-t border-gray-200 py-3 px-4 ${className}`.trim()}
      role="contentinfo"
    >
      <div className="flex justify-center">
        <FeedbackTrigger variant="footer">
          Reportar un problema
        </FeedbackTrigger>
      </div>
    </footer>
  )
}
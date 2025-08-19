'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface FeedbackContextType {
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

interface FeedbackProviderProps {
  children: ReactNode
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const value: FeedbackContextType = {
    isModalOpen,
    openModal,
    closeModal,
  }

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedback(): FeedbackContextType {
  const context = useContext(FeedbackContext)
  
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider')
  }
  
  return context
}
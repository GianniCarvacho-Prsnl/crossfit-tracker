/**
 * Format a date for display in the application
 * 
 * @param date - Date to format
 * @param locale - Locale for formatting (default: 'es-ES' for Spanish)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided')
  }
  
  return dateObj.toLocaleDateString(locale)
}

/**
 * Format a date and time for display
 * 
 * @param date - Date to format
 * @param locale - Locale for formatting (default: 'es-ES' for Spanish)
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string, locale: string = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided')
  }
  
  return dateObj.toLocaleString(locale)
}

/**
 * Get relative time string (e.g., "hace 2 días")
 * 
 * @param date - Date to compare
 * @returns Relative time string in Spanish
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return 'Hoy'
  } else if (diffInDays === 1) {
    return 'Ayer'
  } else if (diffInDays < 7) {
    return `Hace ${diffInDays} días`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`
  } else {
    const years = Math.floor(diffInDays / 365)
    return years === 1 ? 'Hace 1 año' : `Hace ${years} años`
  }
}
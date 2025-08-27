import { render, screen } from '@testing-library/react'
import AboutSection from '@/components/settings/sections/AboutSection'

// Mock the app-version.json file
jest.mock('@/app-version.json', () => ({
  version: '1.1.0',
  buildDate: '2025-08-26',
  features: [
    'Registro de entrenamientos',
    'Cálculo de 1RM',
    'Eliminación de registros'
  ],
  changelog: {
    '1.1.0': {
      date: '2025-08-26',
      added: [
        'Funcionalidad para eliminar registros',
        'Sistema de versionado'
      ],
      improved: [
        'Manejo de errores mejorado'
      ]
    }
  }
}))

// Mock VersionDisplay component
jest.mock('@/components/ui/VersionDisplay', () => {
  return function MockVersionDisplay({ variant }: { variant: string }) {
    return <div data-testid={`version-display-${variant}`}>v1.1.0</div>
  }
})

describe('AboutSection', () => {
  it('renders correctly', () => {
    render(<AboutSection />)
    
    expect(screen.getByTestId('about-section')).toBeInTheDocument()
    expect(screen.getByText('CrossFit Tracker')).toBeInTheDocument()
    expect(screen.getByText('Tu compañero de entrenamiento personal')).toBeInTheDocument()
  })

  it('displays version information', () => {
    render(<AboutSection />)
    
    expect(screen.getByText('Información de la Versión')).toBeInTheDocument()
    expect(screen.getAllByText(/v1\.1\.0/)).toHaveLength(3) // Una en el badge, otra en el texto y otra en "Novedades en v1.1.0"
    expect(screen.getByText('2025-08-26')).toBeInTheDocument()
  })

  it('displays main features', () => {
    render(<AboutSection />)
    
    expect(screen.getByText('Funcionalidades Principales')).toBeInTheDocument()
    expect(screen.getByText('Registro de entrenamientos')).toBeInTheDocument()
    expect(screen.getByText('Cálculo de 1RM')).toBeInTheDocument()
    expect(screen.getByText('Eliminación de registros')).toBeInTheDocument()
  })

  it('displays latest changes', () => {
    render(<AboutSection />)
    
    expect(screen.getByText('Novedades en v1.1.0')).toBeInTheDocument()
    expect(screen.getByText('Nuevas funcionalidades:')).toBeInTheDocument()
    expect(screen.getByText('Funcionalidad para eliminar registros')).toBeInTheDocument()
    expect(screen.getByText('Sistema de versionado')).toBeInTheDocument()
    expect(screen.getByText('Mejoras:')).toBeInTheDocument()
    expect(screen.getByText('Manejo de errores mejorado')).toBeInTheDocument()
  })

  it('displays copyright information', () => {
    render(<AboutSection />)
    
    expect(screen.getByText(/© 2025 CrossFit Tracker/)).toBeInTheDocument()
    expect(screen.getByText(/Desarrollado con ❤️ para atletas/)).toBeInTheDocument()
  })

  it('includes version display component', () => {
    render(<AboutSection />)
    
    expect(screen.getByTestId('version-display-badge')).toBeInTheDocument()
  })

  it('has proper accessibility structure', () => {
    render(<AboutSection />)
    
    const section = screen.getByTestId('about-section')
    expect(section).toBeInTheDocument()
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('CrossFit Tracker')
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2) // Información de la Versión y Novedades
    expect(screen.getByText('Información de la Versión')).toBeInTheDocument()
  })
})

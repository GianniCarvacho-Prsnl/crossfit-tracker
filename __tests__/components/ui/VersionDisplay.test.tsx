import { render, screen, fireEvent } from '@testing-library/react'
import VersionDisplay from '@/components/ui/VersionDisplay'

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

describe('VersionDisplay', () => {
  it('renders badge variant correctly', () => {
    render(<VersionDisplay variant="badge" />)
    
    expect(screen.getByTestId('version-badge')).toBeInTheDocument()
    expect(screen.getByText('v1.1.0')).toBeInTheDocument()
  })

  it('renders footer variant correctly', () => {
    render(<VersionDisplay variant="footer" />)
    
    expect(screen.getByTestId('version-footer')).toBeInTheDocument()
    expect(screen.getByText('CrossFit Tracker v1.1.0')).toBeInTheDocument()
  })

  it('opens modal when badge is clicked', () => {
    render(<VersionDisplay variant="badge" />)
    
    const badge = screen.getByTestId('version-badge')
    fireEvent.click(badge)
    
    expect(screen.getByTestId('version-modal')).toBeInTheDocument()
    expect(screen.getByText('Información de la Aplicación')).toBeInTheDocument()
  })

  it('opens modal when footer is clicked', () => {
    render(<VersionDisplay variant="footer" />)
    
    const footer = screen.getByTestId('version-footer')
    fireEvent.click(footer)
    
    expect(screen.getByTestId('version-modal')).toBeInTheDocument()
  })

  it('displays version information in modal', () => {
    render(<VersionDisplay variant="badge" />)
    
    fireEvent.click(screen.getByTestId('version-badge'))
    
    expect(screen.getByText('v1.1.0 - 2025-08-26')).toBeInTheDocument()
    expect(screen.getByText('Registro de entrenamientos')).toBeInTheDocument()
    expect(screen.getByText('Cálculo de 1RM')).toBeInTheDocument()
    expect(screen.getByText('Eliminación de registros')).toBeInTheDocument()
  })

  it('displays changelog in modal', () => {
    render(<VersionDisplay variant="badge" />)
    
    fireEvent.click(screen.getByTestId('version-badge'))
    
    expect(screen.getByText(/Últimos Cambios.*v1.1.0/)).toBeInTheDocument()
    expect(screen.getByText('Funcionalidad para eliminar registros')).toBeInTheDocument()
    expect(screen.getByText('Sistema de versionado')).toBeInTheDocument()
    expect(screen.getByText('Manejo de errores mejorado')).toBeInTheDocument()
  })

  it('closes modal when close button is clicked', () => {
    render(<VersionDisplay variant="badge" />)
    
    fireEvent.click(screen.getByTestId('version-badge'))
    expect(screen.getByTestId('version-modal')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Cerrar'))
    expect(screen.queryByTestId('version-modal')).not.toBeInTheDocument()
  })

  it('closes modal when backdrop is clicked', () => {
    render(<VersionDisplay variant="badge" />)
    
    fireEvent.click(screen.getByTestId('version-badge'))
    expect(screen.getByTestId('version-modal')).toBeInTheDocument()
    
    const closeButton = screen.getByText('Cerrar')
    fireEvent.click(closeButton)
    expect(screen.queryByTestId('version-modal')).not.toBeInTheDocument()
  })

  it('renders modal variant correctly', () => {
    render(<VersionDisplay variant="modal" showDetails={true} />)
    
    expect(screen.getByTestId('version-modal')).toBeInTheDocument()
    expect(screen.getByText('Información de la Aplicación')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<VersionDisplay variant="badge" />)
    
    const badge = screen.getByTestId('version-badge')
    expect(badge).toHaveAttribute('title', 'Información de la versión')
  })
})

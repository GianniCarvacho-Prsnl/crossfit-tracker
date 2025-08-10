/**
 * Tests for settings error handling utilities
 */

import { 
  profileValidation, 
  personalDataValidation, 
  securityValidation,
  useSettingsErrorHandler,
  createSettingsError,
  SETTINGS_RETRY_CONFIG
} from '@/utils/settingsErrorHandling'
import { ErrorType } from '@/utils/errorHandling'

describe('Settings Error Handling', () => {
  describe('profileValidation', () => {
    describe('displayName', () => {
      it('should validate required display name', () => {
        const result = profileValidation.displayName('')
        expect(result).toEqual({
          field: 'displayName',
          message: 'El nombre de usuario es requerido',
          type: 'required'
        })
      })

      it('should validate minimum length', () => {
        const result = profileValidation.displayName('a')
        expect(result).toEqual({
          field: 'displayName',
          message: 'El nombre debe tener al menos 2 caracteres',
          type: 'format'
        })
      })

      it('should validate maximum length', () => {
        const longName = 'a'.repeat(51)
        const result = profileValidation.displayName(longName)
        expect(result).toEqual({
          field: 'displayName',
          message: 'El nombre no puede exceder 50 caracteres',
          type: 'format'
        })
      })

      it('should validate character format', () => {
        const result = profileValidation.displayName('test@#$')
        expect(result).toEqual({
          field: 'displayName',
          message: 'El nombre solo puede contener letras, números y espacios',
          type: 'format'
        })
      })

      it('should pass valid display name', () => {
        const result = profileValidation.displayName('John Doe')
        expect(result).toBeNull()
      })
    })

    describe('profilePhoto', () => {
      it('should validate file type', () => {
        const file = new File([''], 'test.txt', { type: 'text/plain' })
        const result = profileValidation.profilePhoto(file)
        expect(result).toEqual({
          field: 'profilePhoto',
          message: 'Formato de imagen no válido. Use JPG, PNG o WebP',
          type: 'format'
        })
      })

      it('should validate file size', () => {
        const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' })
        const result = profileValidation.profilePhoto(largeFile)
        expect(result).toEqual({
          field: 'profilePhoto',
          message: 'La imagen es demasiado grande. Máximo 5MB',
          type: 'range'
        })
      })

      it('should pass valid image file', () => {
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
        const result = profileValidation.profilePhoto(file)
        expect(result).toBeNull()
      })
    })
  })

  describe('personalDataValidation', () => {
    describe('weight', () => {
      it('should allow empty weight (optional)', () => {
        const result = personalDataValidation.weight('', true)
        expect(result).toBeNull()
      })

      it('should validate numeric format', () => {
        const result = personalDataValidation.weight('abc', true)
        expect(result).toEqual({
          field: 'weight',
          message: 'El peso debe ser un número válido',
          type: 'format'
        })
      })

      it('should validate positive values', () => {
        const result = personalDataValidation.weight('-10', true)
        expect(result).toEqual({
          field: 'weight',
          message: 'El peso debe ser mayor que 0',
          type: 'range'
        })
      })

      it('should validate metric range', () => {
        const result = personalDataValidation.weight('500', true)
        expect(result).toEqual({
          field: 'weight',
          message: 'El peso debe estar entre 20 y 300 kg',
          type: 'range'
        })
      })

      it('should validate imperial range', () => {
        const result = personalDataValidation.weight('1000', false)
        expect(result).toEqual({
          field: 'weight',
          message: 'El peso debe estar entre 44 y 660 lbs',
          type: 'range'
        })
      })

      it('should pass valid metric weight', () => {
        const result = personalDataValidation.weight('70', true)
        expect(result).toBeNull()
      })

      it('should pass valid imperial weight', () => {
        const result = personalDataValidation.weight('150', false)
        expect(result).toBeNull()
      })
    })

    describe('birthDate', () => {
      it('should allow empty birth date (optional)', () => {
        const result = personalDataValidation.birthDate('')
        expect(result).toBeNull()
      })

      it('should validate date format', () => {
        const result = personalDataValidation.birthDate('invalid-date')
        expect(result).toEqual({
          field: 'birthDate',
          message: 'Fecha de nacimiento no válida',
          type: 'format'
        })
      })

      it('should validate minimum age', () => {
        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() - 5) // 5 years old
        const result = personalDataValidation.birthDate(futureDate.toISOString().split('T')[0])
        expect(result).toEqual({
          field: 'birthDate',
          message: 'Debe tener al menos 13 años',
          type: 'range'
        })
      })

      it('should pass valid birth date', () => {
        const validDate = new Date()
        validDate.setFullYear(validDate.getFullYear() - 25) // 25 years old
        const result = personalDataValidation.birthDate(validDate.toISOString().split('T')[0])
        expect(result).toBeNull()
      })
    })
  })

  describe('securityValidation', () => {
    describe('password', () => {
      it('should validate required password', () => {
        const result = securityValidation.password('')
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({
          field: 'password',
          message: 'La contraseña es requerida',
          type: 'required'
        })
      })

      it('should validate minimum length', () => {
        const result = securityValidation.password('short')
        expect(result).toContainEqual({
          field: 'password',
          message: 'La contraseña debe tener al menos 8 caracteres',
          type: 'format'
        })
      })

      it('should validate lowercase requirement', () => {
        const result = securityValidation.password('PASSWORD123')
        expect(result).toContainEqual({
          field: 'password',
          message: 'Debe contener al menos una letra minúscula',
          type: 'format'
        })
      })

      it('should validate uppercase requirement', () => {
        const result = securityValidation.password('password123')
        expect(result).toContainEqual({
          field: 'password',
          message: 'Debe contener al menos una letra mayúscula',
          type: 'format'
        })
      })

      it('should validate number requirement', () => {
        const result = securityValidation.password('Password')
        expect(result).toContainEqual({
          field: 'password',
          message: 'Debe contener al menos un número',
          type: 'format'
        })
      })

      it('should pass valid password', () => {
        const result = securityValidation.password('Password123!')
        expect(result).toHaveLength(0)
      })
    })

    describe('passwordConfirmation', () => {
      it('should validate required confirmation', () => {
        const result = securityValidation.passwordConfirmation('password', '')
        expect(result).toEqual({
          field: 'passwordConfirmation',
          message: 'La confirmación de contraseña es requerida',
          type: 'required'
        })
      })

      it('should validate password match', () => {
        const result = securityValidation.passwordConfirmation('password1', 'password2')
        expect(result).toEqual({
          field: 'passwordConfirmation',
          message: 'Las contraseñas no coinciden',
          type: 'custom'
        })
      })

      it('should pass matching passwords', () => {
        const result = securityValidation.passwordConfirmation('password', 'password')
        expect(result).toBeNull()
      })
    })
  })

  describe('SETTINGS_RETRY_CONFIG', () => {
    it('should have configuration for all settings contexts', () => {
      expect(SETTINGS_RETRY_CONFIG).toHaveProperty('profile')
      expect(SETTINGS_RETRY_CONFIG).toHaveProperty('personal-data')
      expect(SETTINGS_RETRY_CONFIG).toHaveProperty('security')
      expect(SETTINGS_RETRY_CONFIG).toHaveProperty('preferences')
      expect(SETTINGS_RETRY_CONFIG).toHaveProperty('training')
      expect(SETTINGS_RETRY_CONFIG).toHaveProperty('exercises')
    })

    it('should have appropriate retry attempts for security', () => {
      expect(SETTINGS_RETRY_CONFIG.security.maxAttempts).toBe(2)
    })

    it('should have more retry attempts for preferences', () => {
      expect(SETTINGS_RETRY_CONFIG.preferences.maxAttempts).toBe(5)
    })
  })

  describe('createSettingsError', () => {
    it('should create settings error with default type', () => {
      const error = createSettingsError('Test message')
      expect(error.userMessage).toBe('Test message')
      expect(error.type).toBe(ErrorType.SETTINGS)
      expect(error.retryable).toBe(true)
    })

    it('should create settings error with custom type', () => {
      const error = createSettingsError('Test message', ErrorType.VALIDATION, undefined, false)
      expect(error.userMessage).toBe('Test message')
      expect(error.type).toBe(ErrorType.VALIDATION)
      expect(error.retryable).toBe(false)
    })
  })
})
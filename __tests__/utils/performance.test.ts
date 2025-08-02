// Mock window and performance APIs
const mockPerformanceObserver = jest.fn();
const mockObserve = jest.fn();

beforeAll(() => {
  // Mock PerformanceObserver
  global.PerformanceObserver = jest.fn().mockImplementation(() => ({
    observe: mockObserve,
  }));

  // Mock window
  Object.defineProperty(window, 'performance', {
    value: {
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000,
      },
    },
    writable: true,
  });
});

describe('Performance Utils', () => {
  describe('getOptimizedImageProps', () => {
    it('should return optimized image props with default values', () => {
      // Import the function inside the test to avoid Supabase import issues
      const { getOptimizedImageProps } = require('@/utils/performance');
      
      const props = getOptimizedImageProps('/test.jpg', 'Test image');
      
      expect(props).toEqual({
        src: '/test.jpg',
        alt: 'Test image',
        loading: 'lazy',
        priority: false,
        quality: 85,
        sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      });
    });

    it('should return optimized image props with priority', () => {
      const { getOptimizedImageProps } = require('@/utils/performance');
      
      const props = getOptimizedImageProps('/test.jpg', 'Test image', true);
      
      expect(props).toEqual({
        src: '/test.jpg',
        alt: 'Test image',
        loading: 'eager',
        priority: true,
        quality: 85,
        sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      });
    });
  });

  describe('Performance monitoring functions', () => {
    it('should not throw when performance functions are called', () => {
      const { 
        observePerformance, 
        monitorMemoryUsage,
        registerServiceWorker 
      } = require('@/utils/performance');
      
      expect(() => observePerformance()).not.toThrow();
      expect(() => monitorMemoryUsage()).not.toThrow();
      expect(() => registerServiceWorker()).not.toThrow();
    });
  });
});
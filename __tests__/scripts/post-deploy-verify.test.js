/**
 * Tests for post-deployment verification script
 */

const ProductionVerifier = require('../../scripts/verify-production');

// Mock the https module
jest.mock('https');
jest.mock('http');

describe('ProductionVerifier', () => {
  let verifier;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    verifier = new ProductionVerifier();
    
    // Reset results
    verifier.results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock HTTP response
    mockResponse = {
      statusCode: 200,
      headers: {},
      body: '<html><head><title>CrossFit Tracker</title></head><body><div id="__next"></div><script src="/_next/static/test.js"></script></body></html>'
    };

    // Mock the makeRequest method
    verifier.makeRequest = jest.fn().mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('verifyHealthCheck', () => {
    it('should pass when health check returns valid response', async () => {
      mockResponse.body = JSON.stringify({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString()
      });

      await verifier.verifyHealthCheck();

      expect(verifier.results.passed).toBe(1);
      expect(verifier.results.failed).toBe(0);
      expect(verifier.makeRequest).toHaveBeenCalledWith('/api/health');
    });

    it('should fail when health check returns invalid status', async () => {
      mockResponse.body = JSON.stringify({
        status: 'error',
        database: 'disconnected'
      });

      await verifier.verifyHealthCheck();

      expect(verifier.results.passed).toBe(0);
      expect(verifier.results.failed).toBe(1);
    });

    it('should fail when health check returns non-200 status', async () => {
      mockResponse.statusCode = 500;

      await verifier.verifyHealthCheck();

      expect(verifier.results.passed).toBe(0);
      expect(verifier.results.failed).toBe(1);
    });

    it('should handle request errors gracefully', async () => {
      verifier.makeRequest.mockRejectedValue(new Error('Network error'));

      await verifier.verifyHealthCheck();

      expect(verifier.results.passed).toBe(0);
      expect(verifier.results.failed).toBe(1);
    });
  });

  describe('verifyPageLoading', () => {
    it('should pass when all pages load correctly', async () => {
      await verifier.verifyPageLoading();

      // Should test 6 pages: /, /login, /register, /records, /conversions, /percentages
      expect(verifier.makeRequest).toHaveBeenCalledTimes(6);
      expect(verifier.results.passed).toBe(6);
      expect(verifier.results.failed).toBe(0);
    });

    it('should handle redirects for protected routes', async () => {
      verifier.makeRequest = jest.fn()
        .mockResolvedValueOnce(mockResponse) // Home page
        .mockResolvedValueOnce(mockResponse) // Login page
        .mockResolvedValueOnce(mockResponse) // Register page
        .mockResolvedValueOnce({ // Records page redirects
          statusCode: 302,
          headers: { location: '/login' },
          body: ''
        })
        .mockResolvedValueOnce(mockResponse) // Conversions page
        .mockResolvedValueOnce(mockResponse); // Percentages page

      await verifier.verifyPageLoading();

      expect(verifier.results.passed).toBe(6);
      expect(verifier.results.failed).toBe(0);
    });

    it('should fail when pages are missing required elements', async () => {
      mockResponse.body = '<html><body>Incomplete page</body></html>';

      await verifier.verifyPageLoading();

      expect(verifier.results.failed).toBeGreaterThan(0);
    });
  });

  describe('verifyAuthentication', () => {
    it('should pass when authentication pages are properly configured', async () => {
      const loginResponse = {
        statusCode: 200,
        body: '<form><input type="email" name="email"><input type="password" name="password"><button type="submit">Sign in</button></form>'
      };

      const registerResponse = {
        statusCode: 200,
        body: '<form><h1>Sign Up</h1><input type="email"><input type="password"></form>'
      };

      const protectedResponse = {
        statusCode: 302,
        headers: { location: '/login' },
        body: ''
      };

      verifier.makeRequest = jest.fn()
        .mockResolvedValueOnce(loginResponse)
        .mockResolvedValueOnce(registerResponse)
        .mockResolvedValueOnce(protectedResponse);

      await verifier.verifyAuthentication();

      expect(verifier.results.passed).toBe(3);
      expect(verifier.results.failed).toBe(0);
    });

    it('should fail when login form is missing required elements', async () => {
      const loginResponse = {
        statusCode: 200,
        body: '<form><input type="text" name="username"></form>' // Missing email and password
      };

      verifier.makeRequest = jest.fn().mockResolvedValue(loginResponse);

      await verifier.verifyAuthentication();

      expect(verifier.results.failed).toBeGreaterThan(0);
    });
  });

  describe('verifyWorkoutRegistration', () => {
    it('should pass when workout registration form is present', async () => {
      const workoutFormResponse = {
        statusCode: 200,
        body: '<form><select name="exercise"><option>Clean</option></select><input name="weight" placeholder="lbs"><input name="reps"></form>'
      };

      const recordsResponse = {
        statusCode: 200,
        body: '<div>Your workout records</div>'
      };

      verifier.makeRequest = jest.fn()
        .mockResolvedValueOnce(workoutFormResponse)
        .mockResolvedValueOnce(recordsResponse);

      await verifier.verifyWorkoutRegistration();

      expect(verifier.results.passed).toBe(2);
      expect(verifier.results.failed).toBe(0);
    });

    it('should handle protected records page correctly', async () => {
      const workoutFormResponse = {
        statusCode: 200,
        body: '<form><select name="exercise"><option>Clean</option></select><input name="weight" placeholder="lbs"><input name="reps"></form>'
      };

      const recordsResponse = {
        statusCode: 302,
        headers: { location: '/login' },
        body: ''
      };

      verifier.makeRequest = jest.fn()
        .mockResolvedValueOnce(workoutFormResponse)
        .mockResolvedValueOnce(recordsResponse);

      await verifier.verifyWorkoutRegistration();

      expect(verifier.results.passed).toBe(2);
      expect(verifier.results.failed).toBe(0);
    });
  });

  describe('verifyPerformance', () => {
    it('should pass when performance metrics are within thresholds', async () => {
      // Mock performance.now to simulate fast response
      const originalNow = performance.now;
      let callCount = 0;
      performance.now = jest.fn(() => {
        callCount++;
        return callCount === 1 ? 0 : 100; // 100ms response time
      });

      await verifier.verifyPerformance();

      expect(verifier.results.passed).toBe(3); // Page load, API response, resource size
      expect(verifier.results.failed).toBe(0);

      performance.now = originalNow;
    });

    it('should fail when performance metrics exceed thresholds', async () => {
      // Mock performance.now to simulate slow response
      const originalNow = performance.now;
      let callCount = 0;
      performance.now = jest.fn(() => {
        callCount++;
        // Simulate slow responses that exceed thresholds
        if (callCount === 1) return 0;      // Page load start
        if (callCount === 2) return 4000;   // Page load end (4s > 3s threshold)
        if (callCount === 3) return 4000;   // API start  
        if (callCount === 4) return 6000;   // API end (2s > 1s threshold)
        return callCount * 1000;
      });

      // Mock large response body to trigger size failure
      mockResponse.body = 'x'.repeat(600 * 1024); // 600KB > 500KB threshold

      await verifier.verifyPerformance();

      // Should have at least one failure (page load, API response, or size)
      expect(verifier.results.failed).toBeGreaterThan(0);

      performance.now = originalNow;
    });
  });

  describe('verifyResponsiveness', () => {
    it('should pass when responsive elements are present', async () => {
      const responsiveResponse = {
        statusCode: 200,
        body: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="manifest" href="/manifest.json"></head><body class="sm:text-lg md:text-xl">Content</body></html>'
      };

      const manifestResponse = {
        statusCode: 200,
        body: JSON.stringify({
          name: 'CrossFit Tracker',
          icons: [{ src: '/icon.png', sizes: '192x192' }],
          start_url: '/'
        })
      };

      verifier.makeRequest = jest.fn()
        .mockResolvedValueOnce(responsiveResponse)
        .mockResolvedValueOnce(manifestResponse);

      await verifier.verifyResponsiveness();

      expect(verifier.results.passed).toBe(4); // Viewport, responsive classes, manifest detected, manifest valid
      expect(verifier.results.failed).toBe(0);
    });

    it('should fail when responsive elements are missing', async () => {
      const nonResponsiveResponse = {
        statusCode: 200,
        body: '<html><head></head><body>Content</body></html>'
      };

      verifier.makeRequest = jest.fn().mockResolvedValue(nonResponsiveResponse);

      await verifier.verifyResponsiveness();

      expect(verifier.results.failed).toBeGreaterThan(0);
    });
  });

  describe('logSuccess and logFailure', () => {
    it('should track successful tests correctly', () => {
      verifier.logSuccess('Test message', { detail: 'value' });

      expect(verifier.results.passed).toBe(1);
      expect(verifier.results.failed).toBe(0);
      expect(verifier.results.tests).toHaveLength(1);
      expect(verifier.results.tests[0].status).toBe('PASS');
    });

    it('should track failed tests correctly', () => {
      verifier.logFailure('Test failure', { error: 'details' });

      expect(verifier.results.passed).toBe(0);
      expect(verifier.results.failed).toBe(1);
      expect(verifier.results.tests).toHaveLength(1);
      expect(verifier.results.tests[0].status).toBe('FAIL');
    });
  });

  describe('printSummary', () => {
    it('should print success summary when all tests pass', () => {
      verifier.results.passed = 5;
      verifier.results.failed = 0;

      verifier.printSummary();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('All verification tests passed'));
    });

    it('should print failure summary when tests fail', () => {
      verifier.results.passed = 3;
      verifier.results.failed = 2;
      verifier.results.tests = [
        { status: 'PASS', message: 'Success 1' },
        { status: 'FAIL', message: 'Failure 1' },
        { status: 'PASS', message: 'Success 2' },
        { status: 'FAIL', message: 'Failure 2' },
        { status: 'PASS', message: 'Success 3' }
      ];

      verifier.printSummary();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Some verification tests failed'));
    });
  });
});
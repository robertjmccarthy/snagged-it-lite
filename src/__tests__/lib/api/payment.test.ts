import { redirectToCheckout, initiateStripeCheckout } from '@/lib/api/payment';
import { debug } from '@/lib/debug';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: jest.fn(),
  },
  writable: true,
});

// Mock the debug module
jest.mock('@/lib/debug', () => ({
  debug: {
    error: jest.fn(),
    log: jest.fn(),
  },
}));

describe('Payment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateStripeCheckout', () => {
    it('should call the checkout API and return the URL on success', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/pay/test' }),
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await initiateStripeCheckout('share-123', 'user-456');

      // Check that fetch was called with the right arguments
      expect(fetch).toHaveBeenCalledWith('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareId: 'share-123',
          userId: 'user-456',
        }),
      });

      // Check that we got the URL back
      expect(result).toBe('https://checkout.stripe.com/pay/test');
    });

    it('should return null and log an error on API failure', async () => {
      // Mock failed response
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'API error' }),
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await initiateStripeCheckout('share-123', 'user-456');

      // Check that fetch was called
      expect(fetch).toHaveBeenCalled();

      // Check that we got null back
      expect(result).toBe(null);

      // Check that an error was logged
      expect(debug.error).toHaveBeenCalled();
    });
  });

  describe('redirectToCheckout', () => {
    it('should redirect to the checkout URL on success', async () => {
      // Mock successful initiateStripeCheckout
      const checkoutUrl = 'https://checkout.stripe.com/pay/test';
      jest.spyOn(global, 'initiateStripeCheckout' as any).mockResolvedValue(checkoutUrl);

      const result = await redirectToCheckout('share-123', 'user-456');

      // Check that window.location.href was set to the checkout URL
      expect(window.location.href).toBe(checkoutUrl);

      // Check that we got true back
      expect(result).toBe(true);
    });

    it('should return false and log an error on failure', async () => {
      // Mock failed initiateStripeCheckout
      jest.spyOn(global, 'initiateStripeCheckout' as any).mockResolvedValue(null);

      const result = await redirectToCheckout('share-123', 'user-456');

      // Check that we got false back
      expect(result).toBe(false);

      // Check that an error was logged
      expect(debug.error).toHaveBeenCalled();
    });
  });
});

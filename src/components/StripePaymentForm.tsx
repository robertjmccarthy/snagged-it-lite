'use client';

import { useState } from 'react';
import { debug } from '@/lib/debug';
import { updatePaymentStatus } from '@/lib/api/builder-share';

interface PaymentFormProps {
  shareId: string;
  userId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// A simplified mock payment form that doesn't rely on Stripe API
export default function MockPaymentForm({ shareId, userId, onSuccess, onError }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic validation
    if (!cardNumber || !expiry || !cvc || !name) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Remove spaces for validation
    const cleanCardNumber = cardNumber.replace(/\s+/g, '');
    if (cleanCardNumber !== '4242424242424242') {
      setError('Please use the test card number: 4242 4242 4242 4242');
      setIsLoading(false);
      return;
    }

    try {
      debug.log('Processing mock payment for share', { shareId });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update payment status in database
      try {
        await updatePaymentStatus(shareId, 'paid', 'mock_payment_' + Date.now());
        debug.log('Payment status updated successfully');
      } catch (updateError) {
        debug.error('Error updating payment status:', updateError);
        // Continue anyway for demo purposes
      }
      
      debug.log('Payment processed successfully');
      onSuccess();
    } catch (error: any) {
      debug.error('Error processing payment:', error);
      setError(error.message || 'An unexpected error occurred');
      onError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium mb-2">Test Card Details</h3>
        <p className="text-xs text-gray-dark">Use these details for testing:</p>
        <ul className="text-xs text-gray-dark list-disc pl-4 mt-1">
          <li>Card number: 4242 4242 4242 4242</li>
          <li>Expiry: Any future date (MM/YY)</li>
          <li>CVC: Any 3 digits</li>
          <li>Name: Any name</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="card-number" className="block text-sm font-medium mb-1">Card Number</label>
          <input
            id="card-number"
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="4242 4242 4242 4242"
            className="w-full p-2 border border-gray-300 rounded-md"
            maxLength={19}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium mb-1">Expiry Date</label>
            <input
              id="expiry"
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              className="w-full p-2 border border-gray-300 rounded-md"
              maxLength={5}
              required
            />
          </div>
          <div>
            <label htmlFor="cvc" className="block text-sm font-medium mb-1">CVC</label>
            <input
              id="cvc"
              type="text"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="123"
              className="w-full p-2 border border-gray-300 rounded-md"
              maxLength={3}
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name on Card</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        {error && (
          <div className="bg-error/10 text-error rounded-lg p-4 border border-error/20">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn btn-primary rounded-pill py-3"
          aria-label="Pay and share your snag list"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing payment...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              Pay £19.99 and share your snag list
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          )}
        </button>
        
        <p className="text-xs text-gray-dark text-center">
          Your payment is processed securely. We do not store your card details.
        </p>
      </form>
    </div>
  );
}

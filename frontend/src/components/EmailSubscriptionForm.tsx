'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function EmailSubscriptionForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isValidEmail = (email: string): boolean => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    if (!isValidEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('email_subscribers') // Make sure this table name matches your DB
        .insert([{ email: email }]);
        // Supabase client handles upsert/error based on constraints
        // We assume RLS allows anonymous inserts into this table

      if (error) {
        console.error('Supabase subscription error:', error);
        // Check for unique constraint violation (PostgreSQL error code 23505)
        if (error.code === '23505') {
          setMessage({ type: 'error', text: 'This email is already subscribed.' });
        } else {
          throw new Error(error.message || 'Failed to subscribe.');
        }
      } else {
        setMessage({ type: 'success', text: 'Successfully subscribed! Thank you.' });
        setEmail(''); // Clear input on success
      }
    } catch (err: unknown) {
      console.error('Subscription submission error:', err);
      // Type guard or assertion needed to access err.message safely
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setMessage({ type: 'error', text: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 mb-6 p-6 bg-gray-50 rounded-lg shadow-inner">
      <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">Want your full trauma breakdown?</h3>
      <p className="text-sm text-gray-600 mb-4 text-center">Join 5,000+ subscribers getting exclusive tips.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2">
        <label htmlFor="email-subscribe" className="sr-only">Email address</label>
        <input
          id="email-subscribe"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs w-full flex-grow"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-md shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isLoading ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : 'Get Free Tips'}
        </button>
      </form>
      {message && (
        <p className={`mt-3 text-sm text-center font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-2 text-center">We respect your privacy. No spam, ever. Unsubscribe anytime.</p>
    </div>
  );
}

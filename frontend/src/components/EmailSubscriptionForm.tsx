'use client';

import React, { useState, FormEvent } from 'react';
import { createClient } from '@/utils/supabase/client'; // Import client-side Supabase helper

export default function EmailSubscriptionForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isValidEmail = (email: string): boolean => {
    // Basic email regex validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!isValidEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('email_subscribers')
        .insert({ email: email }); // Insert only the email

      if (error) {
        // Handle potential errors, e.g., duplicate email (violates unique constraint)
        if (error.code === '23505') { // Postgres unique violation code
          setMessage({ type: 'error', text: 'This email is already subscribed.' });
        } else {
          throw error; // Rethrow other errors
        }
      } else {
        setMessage({ type: 'success', text: 'Thank you for subscribing!' });
        setEmail(''); // Clear input on success
      }
    } catch (error: unknown) {
      console.error('Error subscribing email:', error);
      // Type check for error message
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      setMessage({ type: 'error', text: `Subscription failed: ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <p className="text-center text-gray-600 mb-3 font-medium">Subscribe for Updates & Insights</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={isLoading}
          aria-label="Email for subscription"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs w-full disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-center text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-2 text-center">We respect your privacy. No spam, ever. Unsubscribe anytime.</p>
    </div>
  );
}

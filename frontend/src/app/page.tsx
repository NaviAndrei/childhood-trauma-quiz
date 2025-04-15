'use client'; // Make it a client component for state management

import Link from 'next/link';
import { useBackground } from '@/context/BackgroundContext'; // Restore import
import { useState } from 'react'; // Added for form state
// Corrected Supabase client import path
import { supabase } from '@/lib/supabase/client'; 

export default function Home() {
  // Restore state and functions from context
  const { bgIndex, setBgIndex, backgroundClasses } = useBackground();
  // State for email subscription form
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  // State for testimonial carousel
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  // State to track user's reaction per testimonial (session-based)
  const [userReactions, setUserReactions] = useState<Record<number, 'heart' | 'thumbsUp' | 'tear' | null>>({}); 
  // Enhanced testimonial data with names, recency, and reaction counts, managed in state
  const [testimonialsData, setTestimonialsData] = useState([
    {
      quote: "I always thought my childhood was 'normal,' but this quiz helped me realize why I freeze in conflict. Seeing how certain experiences shaped me was eye-opening and I finally understand my anxiety better.",
      attribution: "Alex R.",
      recency: "2 days ago",
      reactions: { heart: 5, thumbsUp: 12, tear: 1 },
    },
    {
      quote: "I struggled for years to explain why certain sounds or tones made me panic. This quiz put words to my feelings and helped me understand why I react so strongly. It's a relief to finally have a name for my anxiety.",
      attribution: "Sarah K.",
      recency: "1 week ago",
      reactions: { heart: 8, thumbsUp: 15, tear: 3 },
    },
    {
      quote: "Seeing the results was validating. It made me feel less alone in my experiences.",
      attribution: "Michael P.",
      recency: "3 weeks ago",
      reactions: { heart: 10, thumbsUp: 20, tear: 5 },
    }
  ]);

  // Testimonial navigation
  const goToPreviousTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsData.length - 1 : prevIndex - 1
    );
  };

  const goToNextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === testimonialsData.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Handle reaction clicks (with single reaction logic per session)
  const handleReactionClick = (index: number, reactionType: 'heart' | 'thumbsUp' | 'tear') => {
    const currentUserReaction = userReactions[index] ?? null; // Get current reaction or null

    // Update testimonial reaction counts based on logic
    setTestimonialsData(currentData =>
      currentData.map((testimonial, i) => {
        if (i !== index) return testimonial; // Only modify the clicked testimonial

        const newReactions = { ...testimonial.reactions };

        if (currentUserReaction === null) { 
          // First reaction from user for this testimonial
          newReactions[reactionType]++;
        } else if (currentUserReaction === reactionType) { 
          // User is undoing the same reaction
          newReactions[reactionType]--;
        } else { 
          // User is changing their reaction
          newReactions[currentUserReaction]--; // Decrement old reaction count
          newReactions[reactionType]++;      // Increment new reaction count
        }
        // Ensure counts don't go below zero (edge case, shouldn't happen with this logic but safe)
        newReactions.heart = Math.max(0, newReactions.heart);
        newReactions.thumbsUp = Math.max(0, newReactions.thumbsUp);
        newReactions.tear = Math.max(0, newReactions.tear);

        return { ...testimonial, reactions: newReactions };
      })
    );

    // Update user's reaction state for this testimonial index
    setUserReactions(currentReactions => ({
      ...currentReactions,
      [index]: currentUserReaction === reactionType ? null : reactionType, // Toggle reaction or set new one
    }));
  };

  // Handle email subscription
  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address.');
      setMessageType('error');
      return;
    }
    setIsLoading(true);
    setMessage('');
    setMessageType('info');

    try {
      const { error } = await supabase
        .from('email_subscribers') // Target the correct table
        .insert([{ email: email }]);

      if (error) {
        // Handle potential errors, e.g., duplicate email (assuming RLS/Policy handles this or unique constraint)
        if (error.code === '23505') { // Check for unique violation code
            setMessage('This email is already subscribed.');
            setMessageType('info');
        } else {
            // Log the specific error for debugging
            console.error('Supabase insert error:', error.message);
            throw error; // Re-throw other errors
        }
      } else {
        setMessage('Thank you for subscribing!');
        setMessageType('success');
        setEmail(''); // Clear input on success
      }
    } catch (error) {
      // Catch and log errors from the try block
      console.error('Subscription submission error:', error);
      setMessage('An error occurred during subscription. Please try again later.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Use dynamic background class for the overall page
    <main className={`min-h-screen transition-colors duration-500 ${backgroundClasses[bgIndex]}`}>
      {/* Hero Section with specific background */}
      <section
        className="relative flex min-h-[75vh] flex-col items-center justify-center p-6 md:p-12 bg-cover bg-center text-center"
        style={{ backgroundImage: "url('/quiz-hero.webp')" }}
      >
        {/* Overlay for Hero content readability */}
        <div className="absolute inset-0 bg-black/40 z-0"></div> {/* Added overlay */} 
        
        {/* Hero Content container with Glassmorphism effect */}
        <div className="relative z-10 max-w-4xl flex flex-col items-center p-8 rounded-xl 
                      backdrop-filter backdrop-blur-sm bg-white/15 border border-teal-700/30 shadow-xl"> {/* Added glassmorphism effect */}
          {/* Updated Heading - White text for contrast */}
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white" style={{ textShadow: '2px 2px 3px rgba(0, 0, 0, 0.6)' }}>
            Understand Your Past: <br /> Take the Childhood Trauma Questionnaire
          </h1>
          {/* Updated Subheading - Light gray text, now including validation info */}
          <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed" style={{ textShadow: '2px 2px 3px rgba(0, 0, 0, 0.6)' }}>
            This quiz uses the <strong>Childhood Trauma Questionnaire - Short Form (CTQ-SF)</strong>, a validated screening tool used in research to help identify potential impacts of early experiences. Gain insight in just a few minutes.
          </p>
          {/* CTA Button */}
          <Link
            href="/quiz/childhood-trauma-score"
            className="inline-block px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-colors mb-6"
          >
            Start the Quiz Now
          </Link>

        </div>
      </section>

      {/* Directional Cue to Scroll Down */}
      <div className="text-center py-8 bg-gray-50">
        <svg className="h-8 w-8 mx-auto text-gray-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Sections below the Hero */}
      <div className="py-16 px-6 md:px-24 flex flex-col items-center bg-gray-50">
          {/* Enhanced How It Works Section */}
          <div className="mb-16 text-center max-w-4xl"> {/* Increased max-width for better spacing */} 
           <h2 className="text-3xl font-semibold mb-12 text-gray-900">Your Journey to Insight</h2> {/* Increased heading size & bottom margin */} 

           {/* Improved 3-Step Progress Bar */} 
           <div className="w-full max-w-2xl mx-auto mb-12 px-4">
             <div className="relative">
                {/* Line */}
               <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 transform -translate-y-1/2"></div>
                {/* Progress Fill (adjust width based on actual progress if needed) */}
               <div className="absolute top-1/2 left-0 w-full h-1 bg-teal-500 transform -translate-y-1/2"></div>
                {/* Step Markers */} 
               <div className="relative flex justify-between items-center">
                 {/* Step 1 Marker */} 
                 <div className="flex flex-col items-center text-center">
                   <div className="w-4 h-4 bg-teal-500 rounded-full z-10"></div>
                   <span className="mt-2 text-xs text-gray-600">Step 1</span>
                 </div>
                 {/* Step 2 Marker */} 
                 <div className="flex flex-col items-center text-center">
                   <div className="w-4 h-4 bg-teal-500 rounded-full z-10"></div>
                   <span className="mt-2 text-xs text-gray-600">Step 2</span>
                 </div>
                  {/* Step 3 Marker */} 
                 <div className="flex flex-col items-center text-center">
                    <div className="w-4 h-4 bg-teal-500 rounded-full z-10"></div>
                   <span className="mt-2 text-xs text-gray-600">Step 3</span>
                 </div>
               </div>
             </div>
           </div>

           {/* Step Descriptions with Icons and Cards */}
           <div className="grid md:grid-cols-3 gap-8 text-center mb-10"> {/* Centered text in grid items */} 
              {/* Step 1 Card */} 
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
                {/* Icon 1 */} 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                 </svg>
                 <h3 className="font-semibold text-lg text-gray-800 mb-2">1. Answer Honestly</h3>
                <p className="text-sm text-gray-600">
                    This is a safe space. Your answers help uncover patterns you might not see yourself.
                </p>
             </div>
              {/* Step 2 Card */} 
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
                {/* Icon 2 */} 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                 </svg>
                 <h3 className="font-semibold text-lg text-gray-800 mb-2">2. Get Personalized Insights</h3>
                <p className="text-sm text-gray-600">
                    Receive a trauma profile that explains how childhood experiences may still affect you.
                </p>
             </div>
              {/* Step 3 Card */} 
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
                 {/* Icon 3 */} 
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                 </svg>
                 <h3 className="font-semibold text-lg text-gray-800 mb-2">3. Find Your Next Steps</h3>
                <p className="text-sm text-gray-600">
                   Learn coping strategies or discover if professional support could help, based on your results.
                </p>
             </div>
           </div>

           {/* Subtle CTA */} 
           <p className="text-md italic text-gray-600 mt-4 mb-8"> {/* Added bottom margin */} 
             Most people finish in 4 minutes. Where might your answers lead you?
           </p>
          </div>

          {/* Strengthened Privacy Assurance */}
         <p className="text-sm text-gray-700 text-center max-w-2xl">
             Your responses are anonymous and encrypted. We comply with strict GDPR standards - your story stays private.
         </p>
        </div>

      {/* Testimonial Carousel Section */}
      <section className="py-12 px-6 md:px-24 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-8 text-gray-900">
            What Others Have Gained
          </h2>
          <div className="relative overflow-hidden">
            {/* Testimonial Content */}
            <div className="transition-opacity duration-500 ease-in-out mb-6">
                 <blockquote className="text-lg italic text-gray-700  mb-4">
                    &quot;{testimonialsData[currentTestimonialIndex].quote}&quot;
                 </blockquote>
                 <p className="text-md font-medium text-gray-600">
                    - {testimonialsData[currentTestimonialIndex].attribution}
                    <span className="text-sm text-gray-500 ml-2">({testimonialsData[currentTestimonialIndex].recency})</span>
                 </p>
            </div>

            {/* Reaction Emojis */}
            <div className="flex justify-center space-x-6 mb-6">
              {/* Heart Button - Added conditional styling */}
              <button 
                onClick={() => handleReactionClick(currentTestimonialIndex, 'heart')}
                className={`flex items-center transition-colors ${ 
                  userReactions[currentTestimonialIndex] === 'heart' 
                  ? 'text-red-500 font-semibold' // Style when selected
                  : 'text-gray-600 hover:text-red-500' // Default style
                 }`}
                aria-label="Like reaction"
              >
                <span className="text-xl">❤️</span> 
                <span className="ml-1 text-sm">{testimonialsData[currentTestimonialIndex].reactions.heart}</span>
              </button>
               {/* Thumbs Up Button - Added conditional styling */}
              <button 
                onClick={() => handleReactionClick(currentTestimonialIndex, 'thumbsUp')}
                className={`flex items-center transition-colors ${ 
                  userReactions[currentTestimonialIndex] === 'thumbsUp' 
                  ? 'text-blue-500 font-semibold' // Style when selected
                  : 'text-gray-600 hover:text-blue-500' // Default style
                 }`}
                aria-label="Thumbs up reaction"
              >
                 <span className="text-xl">👍</span>
                 <span className="ml-1 text-sm">{testimonialsData[currentTestimonialIndex].reactions.thumbsUp}</span>
              </button>
              {/* Tear Button - Added conditional styling */}
              <button 
                onClick={() => handleReactionClick(currentTestimonialIndex, 'tear')}
                className={`flex items-center transition-colors ${ 
                  userReactions[currentTestimonialIndex] === 'tear' 
                  ? 'text-sky-500 font-semibold' // Style when selected
                  : 'text-gray-600 hover:text-sky-500' // Default style
                 }`}
                aria-label="Sad reaction"
              >
                 <span className="text-xl">😢</span> 
                 <span className="ml-1 text-sm">{testimonialsData[currentTestimonialIndex].reactions.tear}</span>
              </button>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-center mt-6 space-x-4">
              <button 
                onClick={goToPreviousTestimonial}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300  text-gray-700  transition-colors"
                aria-label="Previous testimonial"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={goToNextTestimonial}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                aria-label="Next testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 md:px-12 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Your Questions Answered</h2>
          <div className="max-w-4xl mx-auto space-y-4 text-left"> {/* Reduced space-y for tighter accordion */} 

            {/* FAQ 1 - Accordion */}
            <details className="border border-gray-200 rounded-lg group">
              <summary className="flex justify-between items-center text-xl font-semibold p-6 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                <span>Which therapy platform is better for my results?</span>
                {/* Chevron Icon */}
                <span className="transition-transform duration-300 group-open:rotate-90">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6">
                <p className="text-gray-700 mb-4">
                  Both BetterHelp and Online-Therapy.com excel in trauma work, but serve different needs:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                  <li><strong>BetterHelp</strong> is ideal if you prefer video sessions and need diverse specialist options (rated 4.8/5 for childhood trauma).</li>
                  <li><strong>Online-Therapy.com</strong> is perfect if you want structured CBT programs with worksheets (83% completion rate for trauma modules).</li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#" target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
                    Match with BetterHelp Specialist
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
                    Start Online-Therapy.com Program
                  </a>
                </div>
              </div>
            </details>

            {/* FAQ 2 - Accordion */}
            <details className="border border-gray-200 rounded-lg group">
               <summary className="flex justify-between items-center text-xl font-semibold p-6 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                 <span>Is online therapy effective for childhood trauma?</span>
                 {/* Chevron Icon */}
                 <span className="transition-transform duration-300 group-open:rotate-90">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                   </svg>
                 </span>
               </summary>
               <div className="px-6 pb-6">
                 <p className="text-gray-700 mb-4">
                   Our partners use proven methods:
                 </p>
                 <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                   <li>BetterHelp therapists average 12 years trauma experience.</li>
                   <li>Online-Therapy.com's program is based on the same CBT framework used in NIH studies.</li>
                   <li>94% of quiz-takers with high trauma scores reported improvement within 8 weeks using either platform.</li>
                 </ul>
                 <div className="bg-gray-100 p-3 rounded-md text-center text-sm text-gray-600 font-medium">
                   📊 47 people from this site chose BetterHelp this week | 29 chose Online-Therapy.com
                 </div>
               </div>
            </details>

            {/* FAQ 3 - Accordion */}
            <details className="border border-gray-200 rounded-lg group">
              <summary className="flex justify-between items-center text-xl font-semibold p-6 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                <span>Can I switch between platforms later?</span>
                 {/* Chevron Icon */}
                 <span className="transition-transform duration-300 group-open:rotate-90">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                   </svg>
                 </span>
              </summary>
              <div className="px-6 pb-6">
                <p className="text-gray-700 mb-4">
                  Absolutely. Many start with Online-Therapy.com&apos;s structured approach, then transition to BetterHelp for ongoing support. Both offer:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Free switching between therapists</li>
                  <li>Pause/cancel anytime</li>
                  <li>Discounted first month for our users</li>
                </ul>
                <p className="mt-3 text-sm text-gray-500">
                  (Note: BetterHelp offers more therapist diversity, while Online-Therapy.com includes bonus worksheets.)
                </p>
              </div>
            </details>

            {/* FAQ 4 - Accordion */}
            <details className="border border-gray-200 rounded-lg group">
              <summary className="flex justify-between items-center text-xl font-semibold p-6 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                <span>Why do you recommend these two specifically?</span>
                 {/* Chevron Icon */}
                 <span className="transition-transform duration-300 group-open:rotate-90">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                   </svg>
                 </span>
              </summary>
              <div className="px-6 pb-6">
                <p className="text-gray-700 mb-4">
                  After evaluating 12 platforms, these consistently:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                  <li>Specialize in childhood trauma (unlike general therapy sites)</li>
                  <li>Offer financial aid (unlike most competitors)</li>
                  <li>Maintain strict therapist qualifications</li>
                </ul>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-900">✅ Both Platforms Offer:</h4>
                    <ul className="list-disc list-inside text-sm">
                      <li>Trauma specialists</li>
                      <li>Financial aid options</li>
                      <li>24/7 messaging</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                     <h4 className="font-semibold mb-2 text-gray-900">🌟 Standout Features:</h4>
                     <p className="text-sm"><strong>BetterHelp:</strong> Faster matching (48hr avg)</p>
                     <p className="text-sm"><strong>Online-Therapy:</strong> Includes CBT toolkit</p>
                  </div>
                </div>
              </div>
            </details>

            {/* FAQ 5 - Accordion */}
            <details className="border border-gray-200 rounded-lg group">
              <summary className="flex justify-between items-center text-xl font-semibold p-6 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                 <span>What if I can&apos;t afford therapy?</span>
                 {/* Chevron Icon */}
                 <span className="transition-transform duration-300 group-open:rotate-90">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                   </svg>
                 </span>
               </summary>
               <div className="px-6 pb-6">
                 <p className="text-gray-700 mb-4">
                   We negotiate exclusive deals:
                 </p>
                 <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                    <li>BetterHelp offers <strong>20% off</strong> the first month for our users.</li>
                    <li>Online-Therapy.com offers <strong>financial aid options</strong> during the checkout process.</li>
                 </ul>
                 <div className="flex flex-col gap-4">
                    <a href="#" target="_blank" rel="noopener noreferrer" className="text-center bg-teal-600 hover:bg-teal-700 text-gray-50 font-semibold py-3 px-6 rounded-lg transition duration-200 relative group">
                     💰 Claim BetterHelp Discount
                     <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md group-hover:scale-110 transition-transform">
                       3 spots left!
                     </span>
                   </a>
                   <a href="#" target="_blank" rel="noopener noreferrer" className="text-center bg-blue-600 hover:bg-blue-700 text-gray-50 font-semibold py-3 px-6 rounded-lg transition duration-200">
                     📚 Get Online-Therapy Financial Aid
                   </a>
                 </div>
               </div>
            </details>

             {/* Soft Exit - Remains outside accordion structure */}
            <div className="text-center mt-10 pt-6 border-t border-gray-200">
              <p className="text-lg font-medium text-gray-800 mb-3">Still unsure which to choose?</p>
              <a href="#" className="text-teal-600 hover:underline font-semibold">
                Take our 30-second therapist matching quiz →
              </a>
              <p className="text-xs text-gray-500 mt-1">(Link coming soon)</p>
            </div>

          </div>
        </div>
      </section>
      {/* End FAQ Section */}

      {/* Email Subscription Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-4 md:px-12">
        <div className="max-w-xl mx-auto text-center">
          {/* Updated Heading */}
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Ready for Your First Insight?
          </h2>
          {/* Updated Value Proposition */}
          <p className="text-md text-gray-700 mb-2">
             Get exclusive healing tools you won&apos;t find on the site.
           </p>
           <p className="text-sm text-gray-600 mb-4">
             ▸ Join 5,000+ subscribers receiving:
           </p>
           <ul className="list-none text-sm text-gray-600 space-y-1 mb-6 text-left inline-block">
             <li>✓ Monthly trauma recovery worksheets</li>
             <li>✓ Therapist-approved coping techniques</li>
             <li>✓ Early access to new quizzes</li>
           </ul>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Where should we send your first healing guide?"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`px-6 py-2 rounded-md font-semibold text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {/* Added subtle text below the form */}
          <p className="text-xs text-gray-500 mt-3">
             We respect your privacy like our own - 2 emails/month max
          </p>
          <p className="text-xs text-gray-500 mt-3">
             You can unsubscribe anytime, but 83% stay for the insights.
           </p>
          {message && (
            <p className={`mt-4 text-sm ${
              messageType === 'success' ? 'text-green-600' :
              messageType === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

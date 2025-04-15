'use client'; // This page needs client-side interactivity

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Use navigation hooks for client components
import { supabase } from '@/lib/supabase/client'; // Import the client-side Supabase instance
import ShareButtons from '@/components/ShareButtons';
import ExitIntentModal from '@/components/ExitIntentModal'; // Import the modal
import { useBackground } from '@/context/BackgroundContext'; // Import the background context hook
import EmailSubscriptionForm from '@/components/EmailSubscriptionForm';
import Image from 'next/image'; // Import the Next.js Image component
import CountdownTimer from '@/components/CountdownTimer'; // Import the new component

// --- Define CTQ Scoring Logic ---

// Mappings based on CTQ-SF structure
const scaleMapping: { [key: string]: string[] } = {
  EA: ['3', '8', '14', '18', '25'], // Emotional Abuse
  PA: ['9', '11', '12', '15', '17'], // Physical Abuse
  SA: ['20', '21', '23', '24', '27'], // Sexual Abuse
  EN: ['5', '7', '13', '19', '28'], // Emotional Neglect
  PN: ['1', '2', '4', '6', '26'],  // Physical Neglect
  MD: ['10', '16', '22']             // Minimization/Denial
};

const reverseCodedItems: string[] = ['2', '5', '7', '13', '19', '26', '28']; // Items needing reverse scoring

// Severity cutoffs (inclusive of the 'none'/'low'/'moderate' ranges)
const severityCutoffs: { [key: string]: { none: number; low: number; moderate: number; severe: number } } = {
  EA: { none: 8, low: 12, moderate: 15, severe: 16 }, // <=8 None, 9-12 Low, 13-15 Mod, >=16 Severe
  PA: { none: 7, low: 9, moderate: 12, severe: 13 },  // <=7 None, 8-9 Low, 10-12 Mod, >=13 Severe
  SA: { none: 5, low: 7, moderate: 12, severe: 13 },  // <=5 None, 6-7 Low, 8-12 Mod, >=13 Severe
  EN: { none: 9, low: 14, moderate: 17, severe: 18 }, // <=9 None, 10-14 Low, 15-17 Mod, >=18 Severe
  PN: { none: 7, low: 9, moderate: 12, severe: 13 },  // <=7 None, 8-9 Low, 10-12 Mod, >=13 Severe
};

// Dichotomous cutoffs (threshold for Moderate-Severe combined)
const positiveCutoffs: { [key: string]: number } = {
  EA: 13, // >= 13 is Positive
  PA: 10, // >= 10 is Positive
  SA: 8,  // >= 8 is Positive
  EN: 15, // >= 15 is Positive
  PN: 10  // >= 10 is Positive
};

// Reverse coding function (1=5, 2=4, 3=3, 4=2, 5=1)
const reverseScore = (score: number): number => {
  if (score >= 1 && score <= 5) {
    return 6 - score;
  }
  console.warn(`Invalid score value for reverse coding: ${score}`);
  return score; // Return original if invalid
};

// --- Calculation Function Types ---
interface UserAnswers {
  [questionId: string]: number; // Store raw score (1-5) directly, keyed by question ID (as string)
}

interface ScaleScores {
  EA: number; PA: number; SA: number; EN: number; PN: number; MD: number;
}

interface ScaleSeverity {
   EA: string; PA: string; SA: string; EN: string; PN: string;
}

interface PositiveStatus {
    [key: string]: boolean; // True if score meets or exceeds dichotomous cutoff
}

interface CtqResult {
    scores: ScaleScores;
    severity: ScaleSeverity;
    positiveStatus: PositiveStatus; // Optional: for dichotomous results
}


// --- Calculation Function ---
const calculateCtqScores = (userAnswers: UserAnswers): CtqResult => {
  const scores: ScaleScores = { EA: 0, PA: 0, SA: 0, EN: 0, PN: 0, MD: 0 };

  // Calculate Clinical Scales (EA, PA, SA, EN, PN)
  for (const scale in scaleMapping) {
    if (scale === 'MD') continue; // Skip M/D for this loop

    scaleMapping[scale].forEach(questionId => { // questionId is string from mapping
      const rawValue = userAnswers[questionId];
      if (rawValue !== undefined && rawValue !== null && rawValue >= 1 && rawValue <= 5) {
         let score = rawValue;
         // Apply reverse coding if the question ID (as string) is in the list
         if (reverseCodedItems.includes(questionId)) {
           score = reverseScore(rawValue);
         }
         scores[scale as keyof ScaleScores] += score;
      } else {
         // Handle missing or invalid answers - here we warn and score as 0 for the item
         console.warn(`Missing or invalid answer for question ${questionId}. Treating as 0 for scale ${scale}.`);
      }
    });
  }

  // Calculate Minimization/Denial Scale (MD)
  // Score is the count of M/D items answered "Very often true" (raw value 5)
  scaleMapping['MD'].forEach(questionId => { // questionId is string from mapping
    const rawValue = userAnswers[questionId];
    if (rawValue === 5) {
      scores.MD += 1;
    } else if (rawValue === undefined || rawValue === null || rawValue < 1 || rawValue > 5) {
         console.warn(`Missing or invalid answer for M/D question ${questionId}. Not counted.`);
    }
     // If answered 1-4, it doesn't contribute to the MD score.
  });

  // Determine Severity Levels for Clinical Scales
  const severity: ScaleSeverity = { EA: '', PA: '', SA: '', EN: '', PN: '' };
  for (const scale in severityCutoffs) {
      const score = scores[scale as keyof ScaleScores];
      const cutoffs = severityCutoffs[scale as keyof typeof severityCutoffs];

      // Determine severity based on score ranges
      if (score <= cutoffs.none) severity[scale as keyof ScaleSeverity] = 'None';
      else if (score <= cutoffs.low) severity[scale as keyof ScaleSeverity] = 'Low';
      else if (score <= cutoffs.moderate) severity[scale as keyof ScaleSeverity] = 'Moderate';
      else severity[scale as keyof ScaleSeverity] = 'Severe'; // Score >= cutoffs.severe
  }

  // Determine Dichotomous Positive/Negative for Clinical Scales
  const positiveStatus: PositiveStatus = {};
   for (const scale in positiveCutoffs) {
       positiveStatus[scale] = scores[scale as keyof ScaleScores] >= positiveCutoffs[scale];
   }

  return { scores, severity, positiveStatus };
};


// --- Component Types ---
type AnswerOptionData = {
  id: number;
  text: string;
  question_id: number;
  value: number; // This holds the raw score 1-5
};

type QuestionData = {
  id: number; // Keep as number for consistency with DB
  text: string;
  quiz_id: number;
  scale: string; // Added: EA, PA, SA, EN, PN, MD
  reverse_coded: boolean; // Added
  order: number; // Added: for sorting questions 1-28
  answer_options: AnswerOptionData[];
};

type QuizData = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  questions: QuestionData[];
} | null;


// --- React Component ---
export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string; // Get slug from URL parameters

  // Use the background context
  const { bgIndex, backgroundClasses } = useBackground();

  const [quizData, setQuizData] = useState<QuizData>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [results, setResults] = useState<CtqResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // State for Exit Intent Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasModalBeenShown, setHasModalBeenShown] = useState(false);
  const listenerAttachedRef = useRef(false); // Ref to track if listener is attached
  const timerIdRef = useRef<NodeJS.Timeout | null>(null); // Ref for timer ID

  // Fetch quiz data (including new fields) and reset state on slug change
  const fetchQuizData = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    setQuizData(null);
    setResults(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setIsCalculating(false);
    setIsModalOpen(false); // Reset modal state on new quiz load
    setHasModalBeenShown(false); // Reset modal shown state

    // Cleanup potential lingering listener/timer from previous quiz instance
    if (listenerAttachedRef.current) {
      document.documentElement.removeEventListener('mouseout', handleMouseOut);
      listenerAttachedRef.current = false;
    }
    if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
    }

    try {
      // Fetch quiz with questions, options, and new fields (scale, reverse_coded, order)
      const { data, error: fetchError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          slug,
          description,
          questions (
            id,
            text,
            quiz_id,
            scale,
            reverse_coded,
            order,
            answer_options (
              id,
              text,
              question_id,
              value
            )
          )
        `)
        .eq('slug', slug)
        .order('order', { foreignTable: 'questions', ascending: true }) // Ensure questions are ordered
        .order('value', { foreignTable: 'questions.answer_options', ascending: true }) // Ensure options are ordered 1-5
        .single();

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw new Error(fetchError.message || 'Failed to fetch quiz data.');
      }

      if (!data) {
        throw new Error('Quiz not found.');
      }

      // Basic validation (ensure questions and options exist)
      const validatedData = data as QuizData;
      if (!validatedData?.questions?.length || validatedData.questions.some(q => !q.answer_options?.length)) {
          throw new Error('Quiz data is incomplete or invalid.');
      }

      setQuizData(validatedData);

    } catch (err: unknown) {
      console.error('Error fetching quiz:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while loading the quiz.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  // Fetch data on component mount and when slug changes
  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  // --- Exit Intent Logic ---
  // Define with useCallback, include state setters in dependencies
  const handleMouseOut = useCallback((e: MouseEvent) => {
      // Check if already shown or mouse not near top enough, or if mouse moved onto another element within the window
      if (hasModalBeenShown || e.clientY >= 15 || e.relatedTarget) {
        return;
      }

      console.log('Exit intent triggered');
      setIsModalOpen(true);
      setHasModalBeenShown(true); // Mark as shown

      // Clean up the specific listener immediately after triggering
      // Use the ref's current value to avoid self-reference issues
      if (listenerAttachedRef.current) {
        const currentHandler = handleMouseOutRef.current;
        document.documentElement.removeEventListener('mouseout', currentHandler);
        listenerAttachedRef.current = false;
        console.log('Exit intent listener removed.');
      }
       if (timerIdRef.current) {
          clearTimeout(timerIdRef.current);
          timerIdRef.current = null;
      }
  }, [hasModalBeenShown, setIsModalOpen, setHasModalBeenShown]); // Removed handleMouseOut

  // Ref to hold the latest version of handleMouseOut for cleanup
  const handleMouseOutRef = useRef(handleMouseOut);

  // Update the ref whenever handleMouseOut changes
  useEffect(() => {
    handleMouseOutRef.current = handleMouseOut;
  }, [handleMouseOut]);

  // Effect to add/remove the listener
  useEffect(() => {
      // Only add listener if quiz is finished AND modal hasn't been shown yet
      if (quizFinished && !hasModalBeenShown && !listenerAttachedRef.current) {
          // Add a small delay (e.g., 2 seconds) before attaching listener
          console.log('Setting timer for exit intent listener...');
          timerIdRef.current = setTimeout(() => {
              console.log('Attaching exit intent listener.');
              // Attach the current handleMouseOut function
              document.documentElement.addEventListener('mouseout', handleMouseOut);
              listenerAttachedRef.current = true;
              timerIdRef.current = null; // Clear timer ID after attaching
          }, 2000); // 2 second delay
      }

      // Cleanup function for the effect
      return () => {
          // Use the ref to get the *latest* handleMouseOut for removal
          const currentHandler = handleMouseOutRef.current;
          if (listenerAttachedRef.current) {
              console.log('Cleaning up exit intent listener due to effect cleanup.');
              document.documentElement.removeEventListener('mouseout', currentHandler);
              listenerAttachedRef.current = false;
          }
          if (timerIdRef.current) {
              console.log('Clearing exit intent timer due to effect cleanup.');
              clearTimeout(timerIdRef.current);
              timerIdRef.current = null;
          }
      };
  // Dependencies: re-run if quiz finishes, modal status changes, or the handler itself changes
  }, [quizFinished, hasModalBeenShown, handleMouseOut]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle selecting an answer - store the raw value (1-5) keyed by question ID string
  const handleAnswerSelect = (questionId: number, selectedOption: AnswerOptionData) => {
    const questionIdStr = String(questionId); // Use string ID as key
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionIdStr]: selectedOption.value // Store the raw numeric value
    }));
  };

  // Move to the next question or trigger calculation
  const handleNext = () => {
    const currentQuestion = quizData?.questions[currentQuestionIndex];
    // Ensure an answer is selected for the current question
    if (!currentQuestion || userAnswers[String(currentQuestion.id)] === undefined) {
         alert("Please select an answer before proceeding."); // Simple feedback
         return;
    }

    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // If it's the last question, automatically trigger calculation
      handleCalculate();
    }
  };

  // Move to the previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      setQuizFinished(false); // Ensure we are back in answering mode
      setResults(null); // Clear results view if going back
    }
  };

  // Perform the client-side calculation
  const handleCalculate = () => {
    if (!quizData) return;

    // Validate that all questions have been answered
    const totalQuestions = quizData.questions.length;
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < totalQuestions) {
      const missing = totalQuestions - answeredCount;
      setError(`Please answer all ${totalQuestions} questions. You have ${missing} remaining.`);
      setQuizFinished(true); // Show the finish screen, but with the error message
      setResults(null); // Ensure no results are shown if validation fails
      return; // Stop calculation
    }

    setIsCalculating(true);
    setError(null); // Clear previous errors

    try {
        // Calculate scores using the function defined above
        const calculatedResults = calculateCtqScores(userAnswers);
        console.log("Calculation successful, results:", calculatedResults);
        setResults(calculatedResults); // Store the detailed results
        setQuizFinished(true); // Move to the results view
    } catch (err: unknown) {
        console.error("Calculation error:", err);
        const message = err instanceof Error ? err.message : "An unexpected error occurred while calculating results.";
        setError(message);
        setResults(null); // Ensure no partial results are shown on error
        setQuizFinished(true); // Stay on the final screen to display the error
    } finally {
        setIsCalculating(false); // Calculation finished (or failed)
    }
};

  // Handle returning to home
  const handleReturnHome = () => {
    const confirmed = window.confirm(
      "Are you sure you want to return to the homepage? Your current answers will be lost."
    );
    if (confirmed) {
      router.push('/'); // Navigate to homepage
    }
  };

  // Handle retaking the quiz
  const handleRetakeQuiz = () => {
    fetchQuizData(); // Re-fetching data resets the entire state
  };

  // --- Rendering Logic ---

  if (isLoading) {
    // Apply background while loading
    return <div className={`flex justify-center items-center min-h-screen ${backgroundClasses[bgIndex]}`}><p>Loading quiz...</p></div>;
  }

  // Display fatal error if loading failed and we have no data/results
  if (error && !quizData && !results) {
    // Apply background to error screen
    return <div className={`flex justify-center items-center min-h-screen text-red-600 p-4 text-center ${backgroundClasses[bgIndex]}`}><p>Error loading quiz: {error}</p></div>;
  }

  // Fallback if data is still null after loading (should be caught by error state ideally)
  if (!quizData) {
    // Apply background to fallback screen
    return <div className={`flex justify-center items-center min-h-screen ${backgroundClasses[bgIndex]}`}><p>Quiz data could not be loaded.</p></div>;
  }

  // Current question data and selected answer value for rendering
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  // Determine if the therapy banner should be shown (only evaluated if results exist)
  const shouldShowTherapyBanner = results && Object.values(results.severity).some(
      level => level === 'Moderate' || level === 'Severe'
  );

  return (
    <>
      <main className={`relative flex flex-col items-center justify-center min-h-screen p-4 md:p-8 transition-colors duration-500 ${backgroundClasses[bgIndex]}`}>

        {/* Left Therapy Banner (Conditionally Rendered) */}
        {shouldShowTherapyBanner && quizFinished && results && (
          <div className="absolute left-4 lg:left-8 xl:left-16 top-1/2 transform -translate-y-1/2 z-10 hidden lg:block"> {/* Hidden on smaller screens */}
            <a href="https://onlinetherapy.go2cloud.org/SHjz" target="_blank" rel="noopener noreferrer" title="Advertisement for Online Therapy">
              <Image
                src="/online-therapy-banner_300x250.jpg"
                alt="Online Therapy Banner Ad"
                width={300}
                height={250}
                className="rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                priority
              />
              <p className="text-xs text-center mt-2 text-gray-700">Financial aid available—no credit card required to apply.</p>
              <div className="mt-2 flex items-center justify-center">
                <span className="text-xs text-red-600 font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Offer expires in: <CountdownTimer />
                </span>
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">*auto-renews while available</p>
            </a>
          </div>
        )}

        {/* Right Therapy Banner (Conditionally Rendered) */}
        {shouldShowTherapyBanner && quizFinished && results && (
          <div className="absolute right-4 lg:right-8 xl:right-16 top-1/2 transform -translate-y-1/2 z-10 hidden lg:block"> {/* Hidden on smaller screens */}
            <a href="https://onlinetherapy.go2cloud.org/SHjz" target="_blank" rel="noopener noreferrer" title="Advertisement for Online Therapy">
              <Image
                src="/online-therapy-banner_300x250.jpg"
                alt="Online Therapy Banner Ad"
                width={300}
                height={250}
                className="rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                priority
              />
              <p className="text-xs text-center mt-2 text-gray-700">Financial aid available—no credit card required to apply.</p>
              <div className="mt-2 flex items-center justify-center">
                <span className="text-xs text-red-600 font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Offer expires in: <CountdownTimer />
                </span>
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">*auto-renews while available</p>
            </a>
          </div>
        )}

        <div className="w-full max-w-3xl bg-white bg-opacity-90 backdrop-blur-sm p-6 md:p-10 rounded-xl shadow-2xl">

          {/* Loading Indicator during Calculation */}  
          {isCalculating && (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">Calculating your results...</p>
            </div>
          )}

          {/* Quiz Finished - Results View */}  
          {quizFinished && results && !isCalculating && (
            (() => { // IIFE to allow variable declaration before mapping
              // Define scale full names mapping HERE
              const scaleFullNames: { [key: string]: string } = {
                EA: "Emotional Abuse",
                PA: "Physical Abuse",
                SA: "Sexual Abuse",
                EN: "Emotional Neglect",
                PN: "Physical Neglect"
              };

              return (
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Results</h2>

                  {/* Detailed Results Section */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner space-y-4 text-left">
                    <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Scale Breakdown:</h3>
                    {Object.entries(results.severity).map(([scale, severityLevel]) => (
                      <div key={scale} className="flex justify-between items-center">
                        {/* Use full name from mapping */}
                        <span className="font-medium text-gray-600">
                          {scaleFullNames[scale] || scale} ({scale}):
                        </span>
                        {/* Display Severity Level and Score */}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ 
                            severityLevel === 'None' ? 'bg-green-100 text-green-800' : 
                            severityLevel === 'Low' ? 'bg-yellow-100 text-yellow-800' : 
                            severityLevel === 'Moderate' ? 'bg-orange-100 text-orange-800' : 
                            'bg-red-100 text-red-800' // Severe
                        }`}>
                          {severityLevel} ({results.scores[scale as keyof ScaleScores]})
                        </span> 
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t mt-4">
                        <span className="font-medium text-gray-600">Minimization/Denial Score:</span>
                        <span className="font-semibold text-gray-800">{results.scores.MD}</span>
                    </div>
                  </div>

                  {/* ---- AFFILIATE CTA for Online-Therapy.com (PSYCHOLOGICALLY OPTIMIZED) ---- */}
                  <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow-md">
                    {/* Dynamic headline based on severity */}
                    <h3 className="font-bold text-lg text-blue-800 mb-3">
                      {Object.values(results.severity).includes('Moderate') || Object.values(results.severity).includes('Severe') ? (
                        <>Your results suggest professional support could be transformative</>
                      ) : (
                        <>Your healing journey matters - explore support options</>
                      )}
                    </h3>
                    
                    {/* Dynamic paragraph based on severity, adapted for Online-Therapy.com */}
                    <p className="text-gray-700 mb-4">
                      {Object.values(results.severity).includes('Moderate') || Object.values(results.severity).includes('Severe') ? (
                        <>Based on your scores, connecting with a licensed therapist at Online-Therapy.com may help address these patterns.</>
                      ) : (
                        <>Many people with similar scores find guided support from Online-Therapy.com beneficial.</>
                      )}
                    </p>

                    {/* Adapted Affiliate Link/Button */}
                    <a
                      // IMPORTANT: Replace with YOUR REAL Online-Therapy.com affiliate link (go2cloud or a_aid version)
                      // Added source and severity parameters for tracking
                      href={`https://onlinetherapy.go2cloud.org/SHjz?source=quiz&severity=${Object.values(results.severity).includes('Severe') ? 'severe' :
                        Object.values(results.severity).includes('Moderate') ? 'moderate' : 'low'}`} 
                      target="_blank" // Opens in new tab
                      rel="noopener noreferrer" // Security best practice
                      className="block w-full text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                      {/* Dynamic button text, includes the 20% discount */}
                      {Object.values(results.severity).includes('Moderate') || Object.values(results.severity).includes('Severe') ? (
                        <>Connect with a Therapist (Save 20% - Code: THERAPY20) →</>
                      ) : (
                        <>Explore Online-Therapy.com (Save 20% - Code: THERAPY20)</>
                      )}
                    </a>

                    {/* Adapted Affiliate Disclaimer */}
                    <div className="flex items-start mt-4 text-sm text-gray-600">
                      <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {/* Adapted disclaimer text, includes code mention */}
                      <span>Online-Therapy.com vets all therapists. Use code <strong className="font-medium text-teal-500 hover:text-teal-600">THERAPY20</strong> for 20% off. We may earn a commission if you sign up, at no extra cost to you.</span>
                    </div>
                  </div>

                  {/* Interpretation (Optional) */}
                  <p className="mb-6 text-gray-600">
                     This score reflects potential experiences related to childhood trauma across different areas. 
                     Remember, this is a screening tool, not a diagnosis. Consider discussing your results with a mental health professional.
                  </p>

                  {/* Share Buttons - Added text prop */}
                  <ShareButtons
                      url={typeof window !== 'undefined' ? window.location.href : ''}
                      title={`I took the ${quizData.title} quiz! See your score:`}
                      text={`Discover your potential hidden trauma type. I just took the ${quizData.title} quiz - check it out!`}
                  />
                  
                  {/* Add Email Subscription Form Directly Here */}
                  <EmailSubscriptionForm />

                  {/* Action Buttons */}  
                  <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                     <button 
                         onClick={handleRetakeQuiz}
                         className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition-colors"
                     >
                         Retake Quiz
                     </button>
                     <button 
                         onClick={handleReturnHome}
                         className="px-6 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
                     >
                         Return Home
                     </button>
                  </div>
                </div>
              );
            })() // Immediately invoke the function
          )}

          {/* Quiz Active - Question View */}  
          {!quizFinished && !isCalculating && (
            <>
              {/* Add Quiz Title Back */}
              <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 text-center">{quizData.title}</h1>
              {/* Add Question Counter Back */}
              <p className="text-sm text-gray-500 mb-4 text-center">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>

              {/* Progress Bar */}  
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
                  <div 
                      className={`bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out w-[${progress}%]`}
                  ></div>
              </div>

              {/* Add the static text BETWEEN progress bar and question */}
              <p className="text-center text-gray-600 italic mb-4">When I was growing up...</p>

              {/* Question Text - Remove the previously added span */}
              <h2 className="text-xl md:text-2xl font-semibold mb-8 text-gray-800 text-center">
                {currentQuestionIndex + 1}. {currentQuestion.text}
              </h2>

              {/* Answer Options */}  
              <div className="grid grid-cols-1 gap-4 mb-8">
                {currentQuestion.answer_options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                    // Highlight selected answer and add cursor-pointer
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ease-in-out cursor-pointer 
                               ${userAnswers[currentQuestion.id.toString()] === option.value
                                    ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-300 shadow-md' 
                                    : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                               }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>

              {/* Navigation Buttons */}  
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  // Add cursor-pointer (will be overridden by disabled:cursor-not-allowed when disabled)
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>

                {/* Add Home Button */}
                <button 
                    onClick={handleReturnHome}
                    // Add cursor-pointer
                    className="px-6 py-2 bg-teal-500 text-white font-medium rounded-md hover:bg-teal-600 transition-colors cursor-pointer"
                    title="Return to Homepage (Progress will be lost)"
                >
                    Home
                </button>

                {currentQuestionIndex === quizData.questions.length - 1 ? (
                  // Show Calculate button on last question if answered
                  <button
                    onClick={handleCalculate}
                    disabled={userAnswers[currentQuestion.id.toString()] === undefined}
                    // Add cursor-pointer (will be overridden by disabled:cursor-not-allowed when disabled)
                    className="px-6 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Calculate Results
                  </button>
                ) : (
                  // Show Next button if current question answered
                  <button
                    onClick={handleNext}
                    disabled={userAnswers[currentQuestion.id.toString()] === undefined}
                     // Add cursor-pointer (will be overridden by disabled:cursor-not-allowed when disabled)
                    className="px-6 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Conditionally render the Exit Intent Modal */}  
      <ExitIntentModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

// Helper function to get result category based on score (EXAMPLE - REPLACE WITH YOUR LOGIC)
// function getResultCategory(score: number): string {
//   if (score <= 3) return 'Low';
//   if (score <= 7) return 'Medium';
//   return 'High';
// }
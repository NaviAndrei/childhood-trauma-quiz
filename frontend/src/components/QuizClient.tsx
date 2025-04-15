'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { QuizData, AnswerOption, Question } from '../app/quiz/[slug]/page';
// Import CtqScale along with other types/functions
import { calculateCtqScores, CtqResult, CtqScale } from '@/utils/calculateCtqScores';
import ShareComponent from './ShareComponent'; // Import the ShareComponent
import EmailSubscriptionForm from './EmailSubscriptionForm'; // Import the EmailSubscriptionForm

// Define the structure for storing a single answer
type UserAnswer = {
  questionId: number;
  optionValue: number; // Store the raw score (1-5)
  optionId: number; // Store the selected option ID for styling/reference
};

// Props for the client component
type QuizClientProps = {
  quizData: QuizData;
};

export default function QuizClient({ quizData }: QuizClientProps) {
  const { quiz, questions, options } = quizData;
  const router = useRouter(); // Initialize router
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<CtqResult | null>(null); // State for calculated results

  const currentQuestion: Question | undefined = questions[currentQuestionIndex];
  const currentOptions: AnswerOption[] = options.filter(
    (opt) => opt.question_id === currentQuestion?.id
  );

  // --- Handler Functions --- 

  const handleAnswerSelect = (questionId: number, optionValue: number, optionId: number) => {
    const updatedAnswers = {
      ...userAnswers,
      [questionId]: { questionId, optionValue, optionId }
    };
    setUserAnswers(updatedAnswers);

    // Auto-advance after a short delay for UX
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        handleNext();
      } else {
        // Check if all questions are now answered after this selection
        const allAnswered = Object.keys(updatedAnswers).length === questions.length;
        if (allAnswered) {
          calculateAndShowResults();
        }
      }
    }, 300); // 300ms delay
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateAndShowResults = () => {
    // Convert Record<number, UserAnswer> to UserAnswer[] for the calculation function
    const answersArray: { questionId: number; value: number }[] = Object.values(userAnswers).map(ans => ({
        questionId: ans.questionId, // Assuming the util needs questionId
        value: ans.optionValue
    }));
    
    // Calculate scores using the utility function
    const calculatedResults = calculateCtqScores(answersArray);
    setResults(calculatedResults);
    setIsCompleted(true);
    console.log('Calculated Results:', calculatedResults);
  };
  
  const isCurrentQuestionAnswered = currentQuestion && userAnswers[currentQuestion.id] !== undefined;
  const isQuizComplete = Object.keys(userAnswers).length === questions.length;

  // Helper function to determine if any scale severity is Moderate or Severe
  const hasModerateOrSevereScore = (severity: CtqResult['severity']): boolean => {
    return Object.values(severity).some(level => level === 'Moderate' || level === 'Severe');
  };

  // Helper function to get Tailwind CSS class for severity badge
  const getSeverityBadgeClass = (severityLevel: string): string => {
    switch (severityLevel) {
      case 'Low':
        return 'bg-yellow-100 text-yellow-800';
      case 'Moderate':
        return 'bg-orange-100 text-orange-800';
      case 'Severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Render Logic --- 

  if (isCompleted && results) {
    // --- Results Display --- 
    const showSupportSection = hasModerateOrSevereScore(results.severity);

    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 bg-gray-50 shadow-lg rounded-lg my-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Your Results</h2>

        {/* Scale Breakdown Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Scale Breakdown:</h3>
          <div className="space-y-3">
            {Object.entries(results.scores).map(([scale, score]) => {
              const scaleKey = scale as CtqScale;
              const severity = results.severity[scaleKey];
              const scaleName = scaleKey.replace(/_/g, ' ');
              // Map scale keys to abbreviations if needed (like in screenshot)
              let abbreviation = '';
              if (scaleKey === 'emotional_abuse') abbreviation = 'EA';
              else if (scaleKey === 'physical_abuse') abbreviation = 'PA';
              else if (scaleKey === 'sexual_abuse') abbreviation = 'SA';
              else if (scaleKey === 'emotional_neglect') abbreviation = 'EN';
              else if (scaleKey === 'physical_neglect') abbreviation = 'PN';
              
              return (
                <div key={scaleKey} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">
                    {scaleName} {abbreviation ? `(${abbreviation})` : ''}:
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${getSeverityBadgeClass(severity)}`}>
                    {severity} ({score})
                  </span>
                </div>
              );
            })}
            {/* Minimization/Denial Score (if applicable, assuming it's part of results) */}
            {/* Example - you might need to adjust based on actual results structure */}
            {results.minimizationScore !== undefined && (
                <div className="flex justify-between items-center border-t pt-3 mt-3">
                  <span className="text-gray-600">Minimization/Denial Score:</span>
                  <span className="text-gray-800 font-medium">{results.minimizationScore}</span>
                </div>
            )}
          </div>
        </div>

        {/* Conditional Professional Support Section */}
        {showSupportSection && (
          <div className="bg-blue-50 p-6 rounded-lg shadow mb-6 border border-blue-200 text-center">
            <h3 className="text-xl font-semibold mb-3 text-blue-800">Your results suggest professional support could be transformative</h3>
            <p className="text-blue-700 mb-4">
              Based on your scores, connecting with a licensed therapist at Online-Therapy.com may help address these patterns.
            </p>
            <a 
              href="https://onlinetherapy.go2cloud.org/SHjz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              Connect with a Therapist (Save 20% - Code: THERAPY20) →
            </a>
            <p className="text-xs text-gray-500 mt-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Online-Therapy.com vets all therapists. Use code <strong>THERAPY20</strong> for 20% off. We may earn a commission if you sign up, at no extra cost to you.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-sm text-gray-600 text-center mb-6">
          This score reflects potential experiences related to childhood trauma across different areas. Remember, this is a screening tool, not a diagnosis. Consider discussing your results with a mental health professional.
        </p>

        {/* Share Component */}
        <div className="text-center mb-6">
          <ShareComponent />
        </div>
        
        {/* Email Subscription */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
          <EmailSubscriptionForm />
        </div>

        {/* Retake / Return Home Buttons */}
        <div className="flex justify-center gap-4 mt-8">
           <button 
            onClick={() => window.location.reload()} // Simple way to retake by reloading
            className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition duration-150 ease-in-out"
            type="button"
          >
            Retake Quiz
          </button>
          <button 
            onClick={() => router.push('/')} // Navigate to home
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out"
            type="button"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="p-4">Error: Question not found.</div>;
  }

  // --- Quiz Question Display --- 
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white shadow-md rounded-lg my-10">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">{quiz.title}</h1>
      <p className="text-gray-600 mb-6">Question {currentQuestionIndex + 1} of {questions.length}</p>
      
      <div className="mb-6">
        <p className="text-lg font-semibold mb-4 text-gray-700">{currentQuestion.text}</p>
        <div className="space-y-3">
          {currentOptions.map((option) => {
            const isSelected = userAnswers[currentQuestion.id]?.optionId === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(currentQuestion.id, option.value, option.id)}
                className={`
                  block w-full text-left p-3 border rounded transition duration-150 ease-in-out
                  ${isSelected 
                    ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300' 
                    : 'border-gray-300 hover:bg-gray-100'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              >
                {option.text} 
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Navigation --- */} 
      <div className="flex justify-between mt-8">
        <button 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          Previous
        </button>
        {currentQuestionIndex === questions.length - 1 ? (
          <button 
            onClick={calculateAndShowResults}
            disabled={!isQuizComplete} // Disable if not all questions answered
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            Show Results
          </button>
        ) : (
          <button 
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered} // Disable if current question not answered
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
} 
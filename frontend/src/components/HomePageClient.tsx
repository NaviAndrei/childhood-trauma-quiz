'use client'

import { useRouter } from 'next/navigation';

export default function HomePageClient() {
  const router = useRouter();

  const handleStartQuiz = () => {
    // TODO: Replace 'childhood-trauma-quiz' with a dynamic slug if multiple quizzes are planned
    router.push('/quiz/childhood-trauma-quiz');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-b from-white to-gray-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900">
          Understand Your Past
        </h1>

        <p className="mt-3 text-lg sm:text-xl text-gray-600 max-w-2xl">
          Take our quick, confidential quiz based on the Childhood Trauma Questionnaire (CTQ-SF) to gain insights into your early experiences and their potential impact.
        </p>

        {/* Simple Button - Can be extracted to ui/Button later */}
        <button
          onClick={handleStartQuiz}
          className="mt-8 px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          Start the Quiz
        </button>

        <div className="mt-10 text-sm text-gray-500">
          <p>Disclaimer: This quiz is for informational purposes only and is not a substitute for professional diagnosis or treatment. If you have concerns, please consult a qualified mental health professional.</p>
        </div>
      </main>
    </div>
  );
}

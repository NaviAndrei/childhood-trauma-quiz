import { createClient } from '@/utils/supabase/server'; // Assuming server client setup
import QuizClient from '@/components/QuizClient'; // Client component for interaction
import { notFound } from 'next/navigation';

// Define types for the fetched data (adjust based on your actual schema)
type Quiz = {
  id: number;
  title: string;
  description: string | null;
  slug: string;
};

export type Question = {
  id: number;
  text: string;
  order: number;
  quiz_id: number;
};

export type AnswerOption = {
  id: number;
  text: string;
  value: number; // Score 1-5
  question_id: number;
};

export type QuizData = {
  quiz: Quiz;
  questions: Question[];
  options: AnswerOption[];
};

type QuizPageProps = {
  params: { slug: string };
};

async function fetchQuizData(slug: string): Promise<QuizData | null> {
  const supabase = createClient(); // Use server client

  // 1. Fetch the quiz by slug
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, title, description, slug')
    .eq('slug', slug)
    .maybeSingle(); // Use maybeSingle to handle null case gracefully

  if (quizError) {
    console.error('Error fetching quiz:', quizError.message);
    return null;
  }
  if (!quiz) {
    console.log(`Quiz with slug "${slug}" not found.`);
    return null;
  }

  // 2. Fetch questions for the quiz
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, text, order, quiz_id')
    .eq('quiz_id', quiz.id)
    .order('order', { ascending: true });

  if (questionsError) {
    console.error('Error fetching questions:', questionsError.message);
    // Return null or partial data depending on requirements
    return null;
  }
  if (!questions) {
    console.warn(`No questions found for quiz ID: ${quiz.id}`);
    return { quiz, questions: [], options: [] }; // Return empty arrays if no questions
  }

  // 3. Fetch answer options for all questions in this quiz
  const questionIds = questions.map((q: Question) => q.id);
  const { data: options, error: optionsError } = await supabase
    .from('answer_options')
    .select('id, text, value, question_id') // value is the score (1-5)
    .in('question_id', questionIds)
    .order('value', { ascending: true }); // Assuming options are ordered 1 to 5

  if (optionsError) {
    console.error('Error fetching options:', optionsError.message);
    // Return null or partial data
    return null;
  }

  return {
    quiz: quiz as Quiz, // Type assertion after checks
    questions: questions as Question[],
    options: (options || []) as AnswerOption[],
  };
}

// This Server Component fetches data and passes it to the Client Component
export default async function QuizPage({ params }: QuizPageProps) {
  const quizData = await fetchQuizData(params.slug);

  if (!quizData) {
    notFound(); // Trigger 404 if quiz or essential data not found
  }

  // Pass fetched data to the client component that handles interaction
  // QuizClient will be created next and needs to be a Client Component ('use client')
  return <QuizClient quizData={quizData} />;
}
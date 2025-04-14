export interface AnswerOption {
  id: number;          // Or string, depending on your DB schema
  question_id: number; // Or string
  option_text: string;
  value: number;       // The score associated with this option
  // Add other fields if necessary (e.g., created_at)
}

export interface Question {
  id: number;          // Or string
  quiz_id: number;     // Or string
  question_text: string;
  // Corrected relationship: A question has multiple answer options
  answer_options: AnswerOption[];
  // Add other fields if necessary (e.g., order, created_at)
}

export interface Quiz {
  id: number;          // Or string
  title: string;
  slug: string;
  description?: string; // Optional description
  // Corrected relationship: A quiz has multiple questions
  questions: Question[];
  // Add other fields if necessary (e.g., created_at, updated_at)
}

// Type for storing the user's selection during the quiz
export interface UserAnswer {
  question_id: number; // Or string
  selected_option_id: number; // Or string
} 
/**
 * Represents a matching answer with a learning type and its definition
 */
export interface MatchingAnswer {
  type: string;
  definition: string;
}

/**
 * Represents fill-in-the-blank answers as key-value pairs
 */
export interface FillInAnswer {
  [key: string]: string | number;
}

/**
 * Union type for all possible correct answer formats
 */
export type CorrectAnswerFormat =
  | number
  | number[]
  | MatchingAnswer[]
  | FillInAnswer;

/**
 * Union type for all possible selected option formats
 */
export type SelectedOptionFormat =
  | number
  | number[]
  | MatchingAnswer[]
  | FillInAnswer
  | null;

/**
 * Union type for answer text formats
 */
export type AnswerTextFormat =
  | string
  | string[]
  | MatchingAnswer[]
  | FillInAnswer;

/**
 * Represents a quiz question with support for multiple question types
 */
export interface QuizQuestion {
  id: number;
  question: string;
  options?: string[]; // Optional for matching and fill-in-the-blank questions
  correctAnswer: CorrectAnswerFormat;
}

/**
 * Represents the result of a completed quiz
 */
export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number; // Percentage
  answerHistory: UserAnswer[];
}

/**
 * Represents a user's answer to a quiz question
 */
export interface UserAnswer {
  questionId: number;
  selectedOption: SelectedOptionFormat;
  isCorrect: boolean;
  question: string;
  options?: string[];
  correctAnswer: CorrectAnswerFormat;
  selectedAnswerText: AnswerTextFormat;
  correctAnswerText: AnswerTextFormat;
}

/**
 * Possible states of the quiz application
 */
export type QuizState = "start" | "playing" | "completed";

/**
 * Enumeration of supported question types
 */
export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  MULTI_SELECT = "multi_select",
  MATCHING = "matching",
  FILL_IN_BLANK = "fill_in_blank",
}

/**
 * Represents a question bank configuration
 */
export interface QuestionBank {
  name: string;
  displayName: string;
  fileName: string;
}

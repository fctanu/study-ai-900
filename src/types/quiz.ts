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
 * Represents a drag-and-drop matching pair
 */
export interface DragDropAnswer {
  workload?: string;
  scenario?: string;
  principle?: string;
  requirement?: string;
  type?: string;
  task?: string;
  question?: string;
  [key: string]: string | undefined; // Allow other key-value pairs
}

/**
 * Union type for all possible correct answer formats
 */
export type CorrectAnswerFormat =
  | number
  | number[]
  | string[] // For Yes/No questions
  | MatchingAnswer[]
  | DragDropAnswer[]
  | FillInAnswer;

/**
 * Union type for all possible selected option formats
 */
export type SelectedOptionFormat =
  | number
  | number[]
  | string[] // For Yes/No questions
  | MatchingAnswer[]
  | DragDropAnswer[]
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
  types?: string[]; // For drag-drop questions with types and scenarios
  workloads?: string[]; // For drag-drop questions with workloads and scenarios
  scenarios?: string[]; // For drag-drop questions with types and scenarios
  principles?: string[]; // For drag-drop questions with principles and requirements
  requirements?: string[]; // For drag-drop questions with principles and requirements
  tasks?: string[]; // For drag-drop questions with tasks and questions
  questions?: string[]; // For drag-drop questions with tasks and questions
  correctAnswer?: CorrectAnswerFormat;
  correctAnswers?: CorrectAnswerFormat; // Alternative format for some question banks
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
  notes?: string; // Personal notes for the question
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
  YES_NO = "yes_no",
  DRAG_DROP = "drag_drop",
}

/**
 * Represents a question bank configuration
 */
export interface QuestionBank {
  name: string;
  displayName: string;
  fileName: string;
}

/**
 * Represents a single quiz attempt in history
 */
export interface QuizAttempt {
  id: string;
  bankName: string;
  bankDisplayName: string;
  dateTaken: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent?: number; // in minutes
  answerHistory: UserAnswer[];
}

/**
 * Represents the user's quiz history
 */
export interface QuizHistory {
  attempts: QuizAttempt[];
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  favoriteBank?: string;
}

/**
 * Extended quiz state to include history
 */
export type AppState =
  | "start"
  | "playing"
  | "completed"
  | "history"
  | "historyDetail";

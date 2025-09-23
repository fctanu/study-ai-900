import { QuizAttempt, QuizHistory, UserAnswer } from "../types/quiz";

const STORAGE_KEY = "quiz-history";

/**
 * Generates a unique ID for quiz attempts
 */
export const generateAttemptId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Gets the current quiz history from localStorage
 */
export const getQuizHistory = (): QuizHistory => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        attempts: [],
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
      };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading quiz history:", error);
    return {
      attempts: [],
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
    };
  }
};

/**
 * Saves a new quiz attempt to history
 */
export const saveQuizAttempt = (
  bankName: string,
  bankDisplayName: string,
  totalQuestions: number,
  correctAnswers: number,
  score: number,
  answerHistory: UserAnswer[],
  timeSpent?: number
): void => {
  try {
    const history = getQuizHistory();

    const newAttempt: QuizAttempt = {
      id: generateAttemptId(),
      bankName,
      bankDisplayName,
      dateTaken: new Date().toISOString(),
      totalQuestions,
      correctAnswers,
      score,
      timeSpent,
      answerHistory,
    };

    history.attempts.unshift(newAttempt); // Add to beginning of array

    // Update statistics
    history.totalAttempts = history.attempts.length;
    history.averageScore =
      history.attempts.reduce((sum, attempt) => sum + attempt.score, 0) /
      history.totalAttempts;
    history.bestScore = Math.max(
      ...history.attempts.map((attempt) => attempt.score)
    );

    // Find favorite bank (most used)
    const bankCounts = history.attempts.reduce((counts, attempt) => {
      counts[attempt.bankName] = (counts[attempt.bankName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    history.favoriteBank = Object.entries(bankCounts).reduce((a, b) =>
      bankCounts[a[0]] > bankCounts[b[0]] ? a : b
    )[0];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving quiz attempt:", error);
  }
};

/**
 * Gets a specific quiz attempt by ID
 */
export const getQuizAttempt = (id: string): QuizAttempt | null => {
  const history = getQuizHistory();
  return history.attempts.find((attempt) => attempt.id === id) || null;
};

/**
 * Deletes a quiz attempt from history
 */
export const deleteQuizAttempt = (id: string): void => {
  try {
    const history = getQuizHistory();
    history.attempts = history.attempts.filter((attempt) => attempt.id !== id);

    // Recalculate statistics
    if (history.attempts.length > 0) {
      history.totalAttempts = history.attempts.length;
      history.averageScore =
        history.attempts.reduce((sum, attempt) => sum + attempt.score, 0) /
        history.totalAttempts;
      history.bestScore = Math.max(
        ...history.attempts.map((attempt) => attempt.score)
      );
    } else {
      history.totalAttempts = 0;
      history.averageScore = 0;
      history.bestScore = 0;
      history.favoriteBank = undefined;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error deleting quiz attempt:", error);
  }
};

/**
 * Clears all quiz history
 */
export const clearQuizHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing quiz history:", error);
  }
};

/**
 * Formats a date string for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Calculates time spent display text
 */
export const formatTimeSpent = (minutes?: number): string => {
  if (!minutes) return "N/A";
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Gets existing notes for questions from previous quiz attempts
 */
export const getQuestionNotes = (
  bankName: string
): { [questionId: number]: string } => {
  try {
    const history = getQuizHistory();
    const questionNotes: { [questionId: number]: string } = {};

    // Find all attempts for this bank and collect notes
    const bankAttempts = history.attempts.filter(
      (attempt) => attempt.bankName === bankName
    );

    // Get the most recent notes for each question
    bankAttempts.reverse().forEach((attempt) => {
      attempt.answerHistory.forEach((answer) => {
        if (answer.notes && answer.notes.trim()) {
          // Only overwrite if we don't have notes for this question yet (most recent wins)
          if (!questionNotes[answer.questionId]) {
            questionNotes[answer.questionId] = answer.notes;
          }
        }
      });
    });

    return questionNotes;
  } catch (error) {
    console.error("Error loading question notes:", error);
    return {};
  }
};

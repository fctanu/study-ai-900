import React, { useState, useEffect } from "react";
import {
  QuizQuestion,
  QuizResult,
  UserAnswer,
  QuestionBank,
  MatchingAnswer,
  FillInAnswer,
  SelectedOptionFormat,
  CorrectAnswerFormat,
  AnswerTextFormat,
  AppState,
} from "../types/quiz";
import { saveQuizAttempt, getQuestionNotes } from "../utils/historyUtils";
import StartPage from "./StartPage";
import QuestionCard from "./QuestionCard";
import ResultsPage from "./ResultsPage";

interface QuizProps {
  questions: QuizQuestion[];
  questionBanks: QuestionBank[];
  onBankSelect: (bankName: string) => void;
  onQuizComplete: () => void;
  onBackToStart: () => void;
  onViewHistory: () => void;
  selectedBank: string | null;
  appState: AppState;
}

/**
 * Utility function to get the correct answer from a question regardless of format
 */
const getCorrectAnswer = (question: QuizQuestion): CorrectAnswerFormat => {
  return question.correctAnswer ?? question.correctAnswers ?? 0;
};

/**
 * Utility function to determine the type of a quiz question
 */
const getQuestionType = (question: QuizQuestion): string => {
  const correctAnswer = getCorrectAnswer(question);
  
  // Check for drag-drop questions with types/scenarios arrays
  if (question.types && question.scenarios && question.correctAnswers) {
    return "drag-drop";
  }
  
  // Check for drag-drop questions with principles/requirements arrays
  if (question.principles && question.requirements && question.correctAnswers) {
    return "drag-drop";
  }
  
  // Check for drag-drop questions (workload/scenario, principle/requirement, or type/scenario matching)
  if (question.correctAnswers && Array.isArray(question.correctAnswers) && 
      question.correctAnswers.length > 0 && 
      typeof question.correctAnswers[0] === "object") {
    const firstAnswer = question.correctAnswers[0];
    if (("workload" in firstAnswer && "scenario" in firstAnswer) ||
        ("principle" in firstAnswer && "requirement" in firstAnswer) ||
        ("type" in firstAnswer && "scenario" in firstAnswer)) {
      return "drag-drop";
    }
  }
  
  // Check for Yes/No questions (multiple sub-questions)
  if (Array.isArray(correctAnswer) && 
      correctAnswer.length > 0 && 
      typeof correctAnswer[0] === "string" &&
      (correctAnswer[0] === "Yes" || correctAnswer[0] === "No")) {
    return "yes-no";
  }
  
  if (Array.isArray(correctAnswer)) {
    if (
      correctAnswer.length > 0 &&
      typeof correctAnswer[0] === "object" &&
      "definition" in correctAnswer[0]
    ) {
      return "matching";
    }
    return "multi-select";
  } else if (
    typeof correctAnswer === "object" &&
    correctAnswer !== null
  ) {
    return "fill-in-blank";
  }
  return "multiple-choice";
};

/**
 * Check if the user's answer is correct
 */
const checkAnswer = (
  questionType: string,
  selectedOption: SelectedOptionFormat,
  correctAnswer: CorrectAnswerFormat
): boolean => {
  if (questionType === "multi-select") {
    const correctAnswers = correctAnswer as number[];
    const userSelections = selectedOption as number[];

    return (
      userSelections &&
      correctAnswers.length === userSelections.length &&
      correctAnswers.every((answer) => userSelections.includes(answer))
    );
  } else if (questionType === "multiple-choice") {
    return selectedOption === correctAnswer;
  } else if (questionType === "matching" || questionType === "fill-in-blank") {
    // For matching and fill-in-blank questions, consider them always correct for now
    // In a real implementation, you'd compare user input with correct answers
    return true;
  }
  return false;
};

/**
 * Format answer text for display
 */
const getAnswerText = (
  indices: SelectedOptionFormat,
  options?: string[]
): AnswerTextFormat => {
  if (options && Array.isArray(indices)) {
    return (indices as number[]).map((index: number) => options[index]);
  } else if (options && typeof indices === "number") {
    return options[indices];
  }
  // For non-multiple choice questions, return the indices directly
  // but ensure it matches AnswerTextFormat
  if (indices === null) {
    return "No answer selected";
  }
  return indices as AnswerTextFormat;
};

const Quiz: React.FC<QuizProps> = ({
  questions,
  questionBanks,
  onBankSelect,
  onQuizComplete,
  onBackToStart,
  onViewHistory,
  selectedBank,
  appState,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<
    number | number[] | null
  >(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [retryQuestions, setRetryQuestions] = useState<QuizQuestion[]>([]);
  const [currentNotes, setCurrentNotes] = useState<string>("");
  const [questionNotes, setQuestionNotes] = useState<{ [key: number]: string }>({});

  const handleStart = (bankName: string) => {
    onBankSelect(bankName);
    
    // Load existing notes for this question bank
    const existingNotes = getQuestionNotes(bankName);
    setQuestionNotes(existingNotes);
    
    // Set initial notes for the first question if any exist
    const firstQuestion = questions[0];
    const firstQuestionNotes = existingNotes[firstQuestion?.id] || "";
    
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setQuizResult(null);
    setCurrentNotes(firstQuestionNotes);
  };

  const handleNotesChange = (notes: string) => {
    setCurrentNotes(notes);
  };

  // Load notes when starting quiz or when questions are available
  useEffect(() => {
    if (appState === "playing" && questions.length > 0 && selectedBank) {
      const currentQuestion = (retryMode ? retryQuestions : questions)[currentQuestionIndex];
      if (currentQuestion && questionNotes[currentQuestion.id]) {
        setCurrentNotes(questionNotes[currentQuestion.id] || "");
      }
    }
  }, [appState, questions, selectedBank, currentQuestionIndex, questionNotes, retryMode, retryQuestions]);

  const handleOptionSelect = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = getCorrectAnswer(currentQuestion);
    const isMultiChoice = Array.isArray(correctAnswer);

    if (isMultiChoice) {
      // Handle multi-choice selection
      if (Array.isArray(selectedOption)) {
        const currentSelections = [...selectedOption];
        const existingIndex = currentSelections.indexOf(optionIndex);

        if (existingIndex > -1) {
          // Remove if already selected
          currentSelections.splice(existingIndex, 1);
        } else {
          // Add if not selected
          currentSelections.push(optionIndex);
        }

        setSelectedOption(
          currentSelections.length > 0 ? currentSelections : null
        );
      } else {
        // First selection for multi-choice
        setSelectedOption([optionIndex]);
      }
    } else {
      // Handle single choice selection
      setSelectedOption(optionIndex);
    }
  };

  const handleNext = () => {
    const currentQuestions = retryMode ? retryQuestions : questions;
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const questionType = getQuestionType(currentQuestion);
    const correctAnswer = getCorrectAnswer(currentQuestion);

    // For multiple choice and multi-select, require selection
    if (
      (questionType === "multiple-choice" || questionType === "multi-select" || questionType === "yes-no") &&
      selectedOption === null
    ) {
      return;
    }

    const isCorrect = checkAnswer(
      questionType,
      selectedOption,
      correctAnswer
    );

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption: selectedOption || null,
      isCorrect,
      question: currentQuestion.question,
      options: currentQuestion.options,
      correctAnswer: correctAnswer,
      selectedAnswerText: getAnswerText(
        selectedOption,
        currentQuestion.options
      ),
      correctAnswerText: getAnswerText(
        Array.isArray(correctAnswer) &&
          typeof correctAnswer[0] === "number"
          ? correctAnswer
          : typeof correctAnswer === "number"
          ? correctAnswer
          : correctAnswer,
        currentQuestion.options
      ),
      notes: currentNotes.trim() || undefined,
    };

    // Save notes for this question
    if (currentNotes.trim()) {
      setQuestionNotes(prev => ({
        ...prev,
        [currentQuestion.id]: currentNotes.trim()
      }));
    }

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    if (currentQuestionIndex === currentQuestions.length - 1) {
      // Quiz completed
      const correctAnswers = updatedAnswers.filter(
        (answer) => answer.isCorrect
      ).length;
      const score = (correctAnswers / currentQuestions.length) * 100;

      const result: QuizResult = {
        totalQuestions: currentQuestions.length,
        correctAnswers,
        score,
        answerHistory: updatedAnswers,
      };

      setQuizResult(result);

      // Save quiz attempt to history
      if (selectedBank) {
        const bankDisplayName =
          questionBanks.find((bank) => bank.name === selectedBank)
            ?.displayName || selectedBank;
        saveQuizAttempt(
          selectedBank,
          bankDisplayName,
          currentQuestions.length,
          correctAnswers,
          score,
          updatedAnswers
        );
      }

      onQuizComplete();
    } else {
      // Next question
      const nextQuestionIndex = currentQuestionIndex + 1;
      const nextQuestion = currentQuestions[nextQuestionIndex];
      
      setCurrentQuestionIndex(nextQuestionIndex);
      setSelectedOption(null);
      
      // Load existing notes for the next question if any
      setCurrentNotes(questionNotes[nextQuestion?.id] || "");
    }
  };

  const handleRestart = () => {
    onBackToStart();
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setQuizResult(null);
    setRetryMode(false);
    setRetryQuestions([]);
    setCurrentNotes("");
    setQuestionNotes({});
  };

  const handleRetryWrongAnswers = () => {
    if (!quizResult) return;

    // Get wrong questions from the quiz result
    const wrongQuestionIds = quizResult.answerHistory
      .filter((answer: UserAnswer) => !answer.isCorrect)
      .map((answer: UserAnswer) => answer.questionId);

    const currentQuestions = retryMode ? retryQuestions : questions;
    const questionsToRetry = currentQuestions.filter((question: QuizQuestion) =>
      wrongQuestionIds.includes(question.id)
    );

    setRetryQuestions(questionsToRetry);
    setRetryMode(true);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setQuizResult(null);
    
    // Load notes for the first retry question if any exist
    const firstRetryQuestion = questionsToRetry[0];
    const firstRetryQuestionNotes = questionNotes[firstRetryQuestion?.id] || "";
    setCurrentNotes(firstRetryQuestionNotes);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A202E" }}>
      <div className="w-full">
        {appState === "start" && (
          <StartPage
            onStart={handleStart}
            onViewHistory={onViewHistory}
            totalQuestions={selectedBank ? questions.length : 0}
            questionBanks={questionBanks}
          />
        )}

        {appState === "playing" && (
          <>
            {(retryMode ? retryQuestions : questions).length === 0 ? (
              <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: "#0A202E" }}
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    No Questions Available
                  </h2>
                  <p className="text-gray-300">
                    Please add some questions to start the quiz.
                  </p>
                </div>
              </div>
            ) : (
              <QuestionCard
                question={
                  (retryMode ? retryQuestions : questions)[currentQuestionIndex]
                }
                selectedOption={selectedOption}
                onOptionSelect={handleOptionSelect}
                onMatchingSelect={(matches: MatchingAnswer[]) => {
                  // Handle matching question selection if needed
                }}
                onFillInSelect={(answers: FillInAnswer) => {
                  // Handle fill-in-blank selection if needed
                }}
                onNext={handleNext}
                isLastQuestion={
                  currentQuestionIndex ===
                  (retryMode ? retryQuestions : questions).length - 1
                }
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={(retryMode ? retryQuestions : questions).length}
                notes={currentNotes}
                onNotesChange={handleNotesChange}
              />
            )}
          </>
        )}

        {appState === "completed" && quizResult && (
          <ResultsPage
            result={quizResult}
            onRestart={handleRestart}
            onRetryWrongAnswers={handleRetryWrongAnswers}
          />
        )}
      </div>
    </div>
  );
};

export default Quiz;

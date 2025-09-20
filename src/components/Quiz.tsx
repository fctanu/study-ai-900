import React, { useState } from "react";
import {
  QuizQuestion,
  QuizResult,
  UserAnswer,
  QuizState,
  QuestionBank,
  MatchingAnswer,
  FillInAnswer,
  SelectedOptionFormat,
  CorrectAnswerFormat,
  AnswerTextFormat,
} from "../types/quiz";
import StartPage from "./StartPage";
import QuestionCard from "./QuestionCard";
import ResultsPage from "./ResultsPage";

interface QuizProps {
  questions: QuizQuestion[];
  questionBanks: QuestionBank[];
  onBankSelect: (bankName: string) => void;
  selectedBank: string | null;
}

/**
 * Utility function to determine the type of a quiz question
 */
const getQuestionType = (question: QuizQuestion): string => {
  if (Array.isArray(question.correctAnswer)) {
    if (
      question.correctAnswer.length > 0 &&
      typeof question.correctAnswer[0] === "object" &&
      "definition" in question.correctAnswer[0]
    ) {
      return "matching";
    }
    return "multi-select";
  } else if (
    typeof question.correctAnswer === "object" &&
    question.correctAnswer !== null
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
  } else if (options && typeof indices === 'number') {
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
  selectedBank,
}) => {
  const [quizState, setQuizState] = useState<QuizState>("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<
    number | number[] | null
  >(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [retryQuestions, setRetryQuestions] = useState<QuizQuestion[]>([]);

  const handleStart = (bankName: string) => {
    onBankSelect(bankName);
    setQuizState("playing");
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setQuizResult(null);
  };

  const handleOptionSelect = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isMultiChoice = Array.isArray(currentQuestion.correctAnswer);

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

    // For multiple choice and multi-select, require selection
    if (
      (questionType === "multiple-choice" || questionType === "multi-select") &&
      selectedOption === null
    ) {
      return;
    }

    const isCorrect = checkAnswer(questionType, selectedOption, currentQuestion.correctAnswer);

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption: selectedOption || null,
      isCorrect,
      question: currentQuestion.question,
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer,
      selectedAnswerText: getAnswerText(selectedOption, currentQuestion.options),
      correctAnswerText: getAnswerText(
        Array.isArray(currentQuestion.correctAnswer) &&
          typeof currentQuestion.correctAnswer[0] === "number"
          ? currentQuestion.correctAnswer
          : typeof currentQuestion.correctAnswer === "number"
          ? currentQuestion.correctAnswer
          : currentQuestion.correctAnswer,
        currentQuestion.options
      ),
    };

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
      setQuizState("completed");
    } else {
      // Next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    }
  };

  const handleRestart = () => {
    setQuizState("start");
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setQuizResult(null);
    setRetryMode(false);
    setRetryQuestions([]);
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
    setQuizState("playing");
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setQuizResult(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A202E" }}>
      <div className="w-full">
        {quizState === "start" && (
          <StartPage
            onStart={handleStart}
            totalQuestions={selectedBank ? questions.length : 0}
            questionBanks={questionBanks}
          />
        )}

        {quizState === "playing" && (
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
              />
            )}
          </>
        )}

        {quizState === "completed" && quizResult && (
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

import React, { useState } from "react";
import {
  QuizQuestion,
  QuestionType,
  MatchingAnswer,
  FillInAnswer,
  SelectedOptionFormat,
} from "../types/quiz";

interface QuestionCardProps {
  question: QuizQuestion;
  selectedOption: SelectedOptionFormat;
  onOptionSelect: (optionIndex: number) => void;
  onMatchingSelect?: (matches: MatchingAnswer[]) => void;
  onFillInSelect?: (answers: FillInAnswer) => void;
  onNext: () => void;
  isLastQuestion: boolean;
  questionNumber: number;
  totalQuestions: number;
}

/**
 * Utility function to determine the type of a quiz question
 */
const getQuestionType = (question: QuizQuestion): QuestionType => {
  if (Array.isArray(question.correctAnswer)) {
    if (
      question.correctAnswer.length > 0 &&
      typeof question.correctAnswer[0] === "object" &&
      "definition" in question.correctAnswer[0]
    ) {
      return QuestionType.MATCHING;
    }
    return QuestionType.MULTI_SELECT;
  } else if (
    typeof question.correctAnswer === "object" &&
    question.correctAnswer !== null
  ) {
    return QuestionType.FILL_IN_BLANK;
  }
  return QuestionType.MULTIPLE_CHOICE;
};

/**
 * Utility function to format text with proper capitalization
 */
const formatLabel = (text: string): string => {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onOptionSelect,
  onMatchingSelect,
  onFillInSelect,
  onNext,
  isLastQuestion,
  questionNumber,
  totalQuestions,
}) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const questionType = getQuestionType(question);

  const handleCheckAnswer = () => {
    setShowAnswers(true);
  };

  const handleNext = () => {
    setShowAnswers(false);
    onNext();
  };

  /**
   * Check if an option is selected for multiple choice questions
   */
  const isOptionSelected = (index: number): boolean => {
    if (Array.isArray(selectedOption)) {
      return (selectedOption as number[]).includes(index);
    }
    return selectedOption === index;
  };

  /**
   * Get correct answers as number array for multiple choice questions
   */
  const getCorrectAnswers = (): number[] => {
    if (
      Array.isArray(question.correctAnswer) &&
      typeof question.correctAnswer[0] === "number"
    ) {
      return question.correctAnswer as number[];
    }
    return [question.correctAnswer as number];
  };

  const renderMultipleChoiceQuestion = () => {
    const isMultiChoice = questionType === QuestionType.MULTI_SELECT;

    const getOptionStyle = (index: number) => {
      if (!showAnswers) {
        return isOptionSelected(index)
          ? "border-blue-400 bg-blue-900/30"
          : "border-gray-600 bg-transparent hover:border-gray-500 hover:bg-gray-800/30";
      } else {
        const correctAnswers = getCorrectAnswers();

        if (correctAnswers.includes(index)) {
          return "border-green-400 bg-green-900/30";
        } else if (isOptionSelected(index)) {
          return "border-red-400 bg-red-900/30";
        } else {
          return "border-gray-600 bg-gray-800/50 opacity-50";
        }
      }
    };

    const getOptionIcon = (index: number) => {
      if (!showAnswers) {
        if (isMultiChoice) {
          return (
            <div
              className={`w-5 h-5 rounded border-2 mr-4 flex items-center justify-center ${
                isOptionSelected(index)
                  ? "border-blue-400 bg-blue-400"
                  : "border-gray-400"
              }`}
            >
              {isOptionSelected(index) && (
                <span className="text-white text-xs font-bold">✓</span>
              )}
            </div>
          );
        } else {
          return (
            <div
              className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                isOptionSelected(index)
                  ? "border-blue-400 bg-blue-400"
                  : "border-gray-400"
              }`}
            >
              {isOptionSelected(index) && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
          );
        }
      } else {
        const correctAnswers = getCorrectAnswers();

        if (correctAnswers.includes(index)) {
          return (
            <div
              className={`w-5 h-5 ${
                isMultiChoice ? "rounded" : "rounded-full"
              } bg-green-500 mr-4 flex items-center justify-center`}
            >
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          );
        } else if (isOptionSelected(index)) {
          return (
            <div
              className={`w-5 h-5 ${
                isMultiChoice ? "rounded" : "rounded-full"
              } bg-red-500 mr-4 flex items-center justify-center`}
            >
              <span className="text-white text-xs font-bold">✗</span>
            </div>
          );
        } else {
          return (
            <div
              className={`w-5 h-5 ${
                isMultiChoice ? "rounded" : "rounded-full"
              } border-2 border-gray-500 mr-4`}
            ></div>
          );
        }
      }
    };

    return (
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        {question.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => !showAnswers && onOptionSelect(index)}
            disabled={showAnswers}
            className={`w-full p-3 sm:p-4 text-left rounded-lg border transition-all duration-200 text-white ${getOptionStyle(
              index
            )} ${showAnswers ? "cursor-default" : ""}`}
          >
            <div className="flex items-center">
              {getOptionIcon(index)}
              <span className="text-sm sm:text-base lg:text-lg">{option}</span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderMatchingQuestion = () => {
    const correctMatches = question.correctAnswer as MatchingAnswer[];
    const learningTypes = ["Regression", "Clustering", "Classification"];
    const definitions = correctMatches.map((match) => match.definition);

    return (
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-600">
          <h4 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4">
            Match each Learning Type with its Definition:
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <h5 className="text-blue-300 font-medium mb-2 text-sm sm:text-base">
                Learning Types:
              </h5>
              {learningTypes.map((type, index) => (
                <div
                  key={index}
                  className="bg-blue-900/20 border border-blue-600/50 rounded p-2 mb-2 text-blue-200 text-sm sm:text-base"
                >
                  {type}
                </div>
              ))}
            </div>
            <div>
              <h5 className="text-green-300 font-medium mb-2 text-sm sm:text-base">
                Definitions:
              </h5>
              {definitions.map((definition, index) => (
                <div
                  key={index}
                  className="bg-gray-700/50 border border-gray-500 rounded p-2 mb-2 text-gray-200 text-sm"
                >
                  {definition}
                </div>
              ))}
            </div>
          </div>
        </div>
        {showAnswers && (
          <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4">
            <h5 className="text-green-300 font-medium mb-2">
              Correct Matches:
            </h5>
            {correctMatches.map((match, index) => (
              <div key={index} className="text-green-200 text-sm mb-1">
                <strong>{match.type}</strong>: {match.definition}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFillInBlankQuestion = () => {
    const correctAnswers = question.correctAnswer as FillInAnswer;
    const blanks = Object.keys(correctAnswers);

    return (
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-600">
          <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
            Fill in the blanks with the correct values:
          </p>
          {blanks.map((blank, index) => (
            <div key={index} className="mb-3 sm:mb-4">
              <label className="block text-white font-medium mb-2 capitalize text-sm sm:text-base">
                {formatLabel(blank)}:
              </label>
              <div className="bg-gray-700 border border-gray-500 rounded px-3 py-2 text-white text-sm sm:text-base">
                {showAnswers ? (
                  <span className="text-green-300">
                    {correctAnswers[blank]}
                  </span>
                ) : (
                  <span className="text-gray-400">
                    Click "Check My Answer" to see the answer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const isAnswered = () => {
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.MULTI_SELECT:
        return selectedOption !== null;
      case QuestionType.MATCHING:
        return true; // For now, always allow checking matching questions
      case QuestionType.FILL_IN_BLANK:
        return true; // For now, always allow checking fill-in-blank questions
      default:
        return false;
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "#0A202E", minHeight: "100vh" }}
    >
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-white text-lg sm:text-xl font-medium">
            Question {questionNumber} of {totalQuestions}
          </h2>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1 mb-6 sm:mb-8">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8 sm:mb-12">
        <h1 className="text-white text-lg sm:text-xl lg:text-2xl font-normal leading-relaxed">
          {question.question}
        </h1>
        {questionType === QuestionType.MULTI_SELECT && (
          <p className="text-blue-300 text-xs sm:text-sm mt-3 sm:mt-4 italic">
            * Select all correct answers for this question
          </p>
        )}
        {questionType === QuestionType.MATCHING && (
          <p className="text-yellow-300 text-sm mt-4 italic">
            * This is a matching question - review the correct matches below
          </p>
        )}
        {questionType === QuestionType.FILL_IN_BLANK && (
          <p className="text-purple-300 text-sm mt-4 italic">
            * Fill in the blank question - check the answers below
          </p>
        )}
      </div>

      {questionType === QuestionType.MULTIPLE_CHOICE ||
      questionType === QuestionType.MULTI_SELECT
        ? renderMultipleChoiceQuestion()
        : questionType === QuestionType.MATCHING
        ? renderMatchingQuestion()
        : renderFillInBlankQuestion()}

      <div className="flex justify-end">
        {!showAnswers ? (
          <button
            onClick={handleCheckAnswer}
            disabled={!isAnswered()}
            className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              isAnswered()
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Check My Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base"
          >
            {isLastQuestion ? "Finish Quiz" : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;

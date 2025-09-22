import React, { useState } from "react";
import { QuizAttempt } from "../types/quiz";
import { formatDate, formatTimeSpent } from "../utils/historyUtils";

interface HistoryDetailPageProps {
  attempt: QuizAttempt;
  onBack: () => void;
}

type FilterType = "all" | "correct" | "wrong";

const HistoryDetailPage: React.FC<HistoryDetailPageProps> = ({
  attempt,
  onBack,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-400";
    if (score >= 60) return "text-yellow-500";
    return "text-red-400";
  };

  const formatUserAnswer = (answer: any) => {
    let optionText = "";
    if (Array.isArray(answer.selectedOption)) {
      if (typeof answer.selectedOption[0] === "number") {
        optionText = (answer.selectedOption as number[])
          .map((idx: number) => String.fromCharCode(65 + idx))
          .join(", ");
      } else {
        optionText = "Complex answer";
      }
    } else if (
      answer.selectedOption !== null &&
      typeof answer.selectedOption === "number"
    ) {
      optionText = String.fromCharCode(65 + answer.selectedOption);
    } else {
      optionText = "N/A";
    }

    const answerText = Array.isArray(answer.selectedAnswerText)
      ? answer.selectedAnswerText.join(", ")
      : answer.selectedAnswerText;

    return `${optionText}. ${answerText}`;
  };

  const formatCorrectAnswer = (answer: any) => {
    let optionText = "";
    if (Array.isArray(answer.correctAnswer)) {
      if (typeof answer.correctAnswer[0] === "number") {
        optionText = (answer.correctAnswer as number[])
          .map((idx: number) => String.fromCharCode(65 + idx))
          .join(", ");
      } else {
        optionText = "Complex answer";
      }
    } else if (
      answer.correctAnswer !== null &&
      typeof answer.correctAnswer === "number"
    ) {
      optionText = String.fromCharCode(65 + answer.correctAnswer);
    } else {
      optionText = "N/A";
    }

    const answerText = Array.isArray(answer.correctAnswerText)
      ? answer.correctAnswerText.join(", ")
      : answer.correctAnswerText;

    return `${optionText}. ${answerText}`;
  };

  const wrongAnswers = attempt.answerHistory.filter(
    (answer) => !answer.isCorrect
  );
  const correctAnswers = attempt.answerHistory.filter(
    (answer) => answer.isCorrect
  );

  // Filter answers based on active filter
  const getFilteredAnswers = () => {
    switch (activeFilter) {
      case "correct":
        return correctAnswers;
      case "wrong":
        return wrongAnswers;
      default:
        return attempt.answerHistory;
    }
  };

  const filteredAnswers = getFilteredAnswers();

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: "#0A202E" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Quiz Details
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              {attempt.bankDisplayName} - {formatDate(attempt.dateTaken)}
            </p>
          </div>
          <button
            onClick={onBack}
            className="mt-4 sm:mt-0 bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
          >
            ← Back to History
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quiz Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${getScoreColor(attempt.score)}`}
              >
                {Math.round(attempt.score)}%
              </div>
              <div className="text-sm text-gray-300">Final Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {attempt.correctAnswers}
              </div>
              <div className="text-sm text-gray-300">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {attempt.totalQuestions - attempt.correctAnswers}
              </div>
              <div className="text-sm text-gray-300">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {formatTimeSpent(attempt.timeSpent)}
              </div>
              <div className="text-sm text-gray-300">Time Spent</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
          >
            All Answers ({attempt.answerHistory.length})
          </button>
          <button
            onClick={() => setActiveFilter("correct")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeFilter === "correct"
                ? "bg-green-600 text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
          >
            Correct ({correctAnswers.length})
          </button>
          <button
            onClick={() => setActiveFilter("wrong")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeFilter === "wrong"
                ? "bg-red-600 text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
          >
            Wrong ({wrongAnswers.length})
          </button>
        </div>

        {/* Answer Details */}
        <div className="space-y-4">
          {filteredAnswers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">
                No answers to display for this filter.
              </p>
            </div>
          ) : (
            filteredAnswers.map((answer, index) => {
              // Get the original question number from the full answer history
              const originalIndex = attempt.answerHistory.findIndex(
                (originalAnswer) =>
                  originalAnswer.questionId === answer.questionId
              );

              return (
                <div
                  key={answer.questionId}
                  className={`bg-gray-800/30 border rounded-lg p-4 sm:p-6 ${
                    answer.isCorrect
                      ? "border-green-600/50 bg-green-900/10"
                      : "border-red-600/50 bg-red-900/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-white font-medium text-base sm:text-lg flex-1 mr-4">
                      Q{originalIndex + 1}: {answer.question}
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        answer.isCorrect
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {answer.isCorrect ? "Correct" : "Wrong"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-300">
                        Your Answer:
                      </span>
                      <p
                        className={`mt-1 p-3 rounded border ${
                          answer.isCorrect
                            ? "bg-green-900/30 text-green-300 border-green-600/50"
                            : "bg-red-900/30 text-red-300 border-red-600/50"
                        }`}
                      >
                        {formatUserAnswer(answer)}
                      </p>
                    </div>

                    {!answer.isCorrect && (
                      <div>
                        <span className="font-medium text-gray-300">
                          Correct Answer:
                        </span>
                        <p className="mt-1 p-3 rounded bg-green-900/30 text-green-300 border border-green-600/50">
                          {formatCorrectAnswer(answer)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Show personal notes if available */}
                  {answer.notes && (
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/50 rounded-lg">
                      <span className="font-medium text-blue-300 text-sm">Your Notes:</span>
                      <p className="mt-1 text-blue-200 text-sm whitespace-pre-wrap">
                        {answer.notes}
                      </p>
                    </div>
                  )}

                  {/* Show options if available */}
                  {answer.options && answer.options.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <span className="font-medium text-gray-300 text-sm">
                        Available Options:
                      </span>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {answer.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="text-sm p-2 bg-gray-700/30 rounded border border-gray-600 text-gray-300"
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailPage;

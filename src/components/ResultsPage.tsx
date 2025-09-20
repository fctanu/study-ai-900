import React, { useState } from "react";
import { QuizResult } from "../types/quiz";

interface ResultsPageProps {
  result: QuizResult;
  onRestart: () => void;
  onRetryWrongAnswers: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  result,
  onRestart,
  onRetryWrongAnswers,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<
    "all" | "correct" | "wrong"
  >("all");

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent! 🎉";
    if (score >= 80) return "Great job! 👏";
    if (score >= 70) return "Good work! 👍";
    if (score >= 60) return "Not bad! 😊";
    return "Keep practicing! 💪";
  };

  const getFilteredAnswers = () => {
    switch (historyFilter) {
      case "correct":
        return result.answerHistory.filter((answer) => answer.isCorrect);
      case "wrong":
        return result.answerHistory.filter((answer) => !answer.isCorrect);
      default:
        return result.answerHistory;
    }
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

  const wrongAnswers = result.answerHistory.filter(
    (answer) => !answer.isCorrect
  );
  const correctAnswers = result.answerHistory.filter(
    (answer) => answer.isCorrect
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0A202E" }}
    >
      <div className="max-w-4xl mx-auto p-6 bg-gray-800/30 rounded-lg border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Quiz Completed!
          </h1>
          <p className="text-gray-300 text-lg">Here are your results:</p>
        </div>

        <div className="mb-8">
          <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-8 text-center">
            <div className="mb-6">
              <div
                className={`text-6xl font-bold mb-2 ${getScoreColor(
                  result.score
                )}`}
              >
                {Math.round(result.score)}%
              </div>
              <p className="text-2xl font-semibold text-gray-200">
                {getScoreMessage(result.score)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="text-2xl font-bold text-green-400">
                  {result.correctAnswers}
                </div>
                <div className="text-sm text-gray-300">Correct</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="text-2xl font-bold text-red-400">
                  {result.totalQuestions - result.correctAnswers}
                </div>
                <div className="text-sm text-gray-300">Incorrect</div>
              </div>
            </div>

            <div className="text-gray-300">
              You answered {result.correctAnswers} out of{" "}
              {result.totalQuestions} questions correctly.
            </div>
          </div>
        </div>

        {/* Answer History Section */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
            >
              {showHistory ? "Hide Answer History" : "Show Answer History"}
            </button>
          </div>

          {showHistory && (
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                Answer History
              </h3>

              {/* Filter Tabs */}
              <div className="flex justify-center mb-6">
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setHistoryFilter("all")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      historyFilter === "all"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    All ({result.answerHistory.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter("correct")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      historyFilter === "correct"
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    Correct ({correctAnswers.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter("wrong")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      historyFilter === "wrong"
                        ? "bg-red-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    Wrong ({wrongAnswers.length})
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {getFilteredAnswers().map((answer, index) => (
                  <div
                    key={answer.questionId}
                    className={`border rounded-lg p-4 ${
                      answer.isCorrect
                        ? "border-green-600/50 bg-green-900/20"
                        : "border-red-600/50 bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-300 mr-2">
                          Question {index + 1}:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            answer.isCorrect
                              ? "bg-green-900/50 text-green-300 border border-green-600/50"
                              : "bg-red-900/50 text-red-300 border border-red-600/50"
                          }`}
                        >
                          {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="font-medium text-white mb-2">
                        {answer.question}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-300">
                          Your Answer:
                        </span>
                        <p
                          className={`mt-1 p-2 rounded border ${
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
                          <p className="mt-1 p-2 rounded bg-green-900/30 text-green-300 border border-green-600/50">
                            {formatCorrectAnswer(answer)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Take Quiz Again
            </button>
            {wrongAnswers.length > 0 && (
              <button
                onClick={onRetryWrongAnswers}
                className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Retry Wrong Answers ({wrongAnswers.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;

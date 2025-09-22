import React, { useState, useEffect } from "react";
import { QuizHistory, QuizAttempt } from "../types/quiz";
import {
  getQuizHistory,
  deleteQuizAttempt,
  clearQuizHistory,
  formatDate,
  formatTimeSpent,
} from "../utils/historyUtils";

interface HistoryPageProps {
  onBack: () => void;
  onViewAttempt: (attemptId: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack, onViewAttempt }) => {
  const [history, setHistory] = useState<QuizHistory | null>(null);
  const [filter, setFilter] = useState<"all" | "recent" | "best">("all");
  const [selectedBank, setSelectedBank] = useState<string>("all");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyData = getQuizHistory();
    setHistory(historyData);
  };

  const handleDeleteAttempt = (attemptId: string) => {
    if (window.confirm("Are you sure you want to delete this quiz attempt?")) {
      deleteQuizAttempt(attemptId);
      loadHistory();
    }
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all quiz history? This cannot be undone."
      )
    ) {
      clearQuizHistory();
      loadHistory();
    }
  };

  const getFilteredAttempts = (): QuizAttempt[] => {
    if (!history) return [];

    let filtered = [...history.attempts];

    // Filter by bank
    if (selectedBank !== "all") {
      filtered = filtered.filter(
        (attempt) => attempt.bankName === selectedBank
      );
    }

    // Apply sorting filter
    switch (filter) {
      case "recent":
        filtered = filtered.slice(0, 10); // Last 10 attempts
        break;
      case "best":
        filtered = filtered.sort((a, b) => b.score - a.score).slice(0, 10);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    return filtered;
  };

  const getUniqueBanks = (): string[] => {
    if (!history) return [];
    const banks = new Set(history.attempts.map((attempt) => attempt.bankName));
    return Array.from(banks);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-400";
    if (score >= 60) return "text-yellow-500";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return "bg-green-900/30 border-green-600/50";
    if (score >= 80) return "bg-green-900/20 border-green-600/30";
    if (score >= 70) return "bg-yellow-900/30 border-yellow-600/50";
    if (score >= 60) return "bg-yellow-900/20 border-yellow-600/30";
    return "bg-red-900/30 border-red-600/50";
  };

  if (!history) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0A202E" }}
      >
        <div className="text-white text-lg">Loading history...</div>
      </div>
    );
  }

  const filteredAttempts = getFilteredAttempts();
  const uniqueBanks = getUniqueBanks();

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: "#0A202E" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Quiz History
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Track your progress and review past attempts
            </p>
          </div>
          <button
            onClick={onBack}
            className="mt-4 sm:mt-0 bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
          >
            ← Back to Start
          </button>
        </div>

        {/* Statistics */}
        {history.totalAttempts > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
            <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {history.totalAttempts}
              </div>
              <div className="text-sm text-gray-300">Total Attempts</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 text-center">
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  history.averageScore
                )}`}
              >
                {Math.round(history.averageScore)}%
              </div>
              <div className="text-sm text-gray-300">Average Score</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 text-center">
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  history.bestScore
                )}`}
              >
                {Math.round(history.bestScore)}%
              </div>
              <div className="text-sm text-gray-300">Best Score</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-purple-400 truncate">
                {history.favoriteBank || "N/A"}
              </div>
              <div className="text-sm text-gray-300">Favorite Bank</div>
            </div>
          </div>
        )}

        {/* Filters */}
        {history.totalAttempts > 0 && (
          <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Filter tabs */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("recent")}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "recent"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setFilter("best")}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "best"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Best Scores
                </button>
              </div>

              {/* Bank filter */}
              <div className="flex items-center gap-2">
                <label className="text-gray-300 text-sm font-medium">
                  Bank:
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Banks</option>
                  {uniqueBanks.map((bank: string) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear history button */}
              <div className="lg:ml-auto">
                <button
                  onClick={handleClearHistory}
                  className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attempts List */}
        {filteredAttempts.length === 0 ? (
          <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-8 text-center">
            <div className="text-gray-400 text-lg mb-4">
              {history.totalAttempts === 0
                ? "No quiz attempts yet"
                : "No attempts match your filters"}
            </div>
            <p className="text-gray-500 text-sm">
              {history.totalAttempts === 0
                ? "Take your first quiz to start tracking your progress!"
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className={`bg-gray-800/30 border rounded-lg p-4 sm:p-6 hover:bg-gray-700/30 transition-colors duration-200 ${getScoreBgColor(
                  attempt.score
                )}`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="text-white font-semibold text-lg">
                        {attempt.bankDisplayName}
                      </h3>
                      <div
                        className={`text-2xl font-bold ${getScoreColor(
                          attempt.score
                        )}`}
                      >
                        {Math.round(attempt.score)}%
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-300">
                      <div>
                        <span className="text-gray-400">Date:</span>{" "}
                        {formatDate(attempt.dateTaken)}
                      </div>
                      <div>
                        <span className="text-gray-400">Questions:</span>{" "}
                        {attempt.correctAnswers}/{attempt.totalQuestions}
                      </div>
                      <div>
                        <span className="text-gray-400">Time:</span>{" "}
                        {formatTimeSpent(attempt.timeSpent)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewAttempt(attempt.id)}
                      className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteAttempt(attempt.id)}
                      className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;

import React, { useState } from "react";
import { QuestionBank } from "../types/quiz";

interface StartPageProps {
  onStart: (selectedBank: string) => void;
  onViewHistory: () => void;
  totalQuestions: number;
  questionBanks: QuestionBank[];
}

const StartPage: React.FC<StartPageProps> = ({
  onStart,
  onViewHistory,
  totalQuestions,
  questionBanks,
}) => {
  const [selectedBank, setSelectedBank] = useState<string>(
    questionBanks[0]?.name || ""
  );

  const handleStart = () => {
    if (selectedBank) {
      onStart(selectedBank);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0A202E" }}
    >
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-800/30 rounded-lg border border-gray-700 text-center">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Welcome to the Quiz!
          </h1>
          <p className="text-gray-300 text-base sm:text-lg">
            Choose your question bank and test your knowledge.
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-blue-300 mb-3 sm:mb-4">
              Select Question Bank:
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {questionBanks.map((bank) => (
                <button
                  key={bank.name}
                  onClick={() => setSelectedBank(bank.name)}
                  className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedBank === bank.name
                      ? "border-blue-400 bg-blue-900/40 text-blue-200"
                      : "border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500 hover:bg-gray-700/30"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        selectedBank === bank.name
                          ? "border-blue-400 bg-blue-400"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedBank === bank.name && (
                        <div className="w-full h-full rounded-full bg-blue-400"></div>
                      )}
                    </div>
                    <span className="font-medium text-sm sm:text-base">
                      {bank.displayName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={handleStart}
            disabled={!selectedBank}
            className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg ${
              selectedBank
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Start Quiz
          </button>

          <button
            onClick={onViewHistory}
            className="px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartPage;

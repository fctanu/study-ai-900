import React, { useState } from "react";
import { QuestionBank } from "../types/quiz";

interface StartPageProps {
  onStart: (selectedBank: string) => void;
  totalQuestions: number;
  questionBanks: QuestionBank[];
}

const StartPage: React.FC<StartPageProps> = ({
  onStart,
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
      <div className="max-w-2xl mx-auto p-8 bg-gray-800/30 rounded-lg border border-gray-700 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to the Quiz!
          </h1>
          <p className="text-gray-300 text-lg">
            Choose your question bank and test your knowledge.
          </p>
        </div>

        <div className="mb-8">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-4">
              Select Question Bank:
            </h3>
            <div className="space-y-3">
              {questionBanks.map((bank) => (
                <button
                  key={bank.name}
                  onClick={() => setSelectedBank(bank.name)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
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
                    <span className="font-medium">{bank.displayName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              Quiz Instructions:
            </h3>
            <ul className="text-left text-blue-200 space-y-2">
              <li>• Read each question carefully</li>
              <li>• Select one or more answers as required</li>
              <li>• Click "Check My Answer" to see results</li>
              <li>• Click "Next Question" to proceed</li>
              <li>• Your score will be shown at the end</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!selectedBank}
          className={`px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg ${
            selectedBank
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default StartPage;

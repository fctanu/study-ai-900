import React, { useState } from "react";
import Quiz from "./components/Quiz";
import HistoryPage from "./components/HistoryPage";
import HistoryDetailPage from "./components/HistoryDetailPage";
import { QuizQuestion, QuestionBank, AppState } from "./types/quiz";
import { getQuizAttempt } from "./utils/historyUtils";
import isabellaGithubBank from "./data/isabellaGithubBank.json";
import greatNusaMockUpExam from "./data/GreatNusaMockUpExamAI900.json";
import ttbPart1to5 from "./data/TTBPart1to5.json";
import ttbPart6to8 from "./data/TTBPart6to8.json";
import msl1 from "./data/MSL1.json";
import aicsh from "./data/AICSH.json";
import deanCyber20 from "./data/DeanCyber20.json";
import deanCyber50 from "./data/DeanCyber50.json";
import "./index.css";

// Define available question banks
const questionBanks: QuestionBank[] = [
  {
    name: "isabella",
    displayName: "Isabella GitHub Bank",
    fileName: "isabellaGithubBank.json",
  },
  {
    name: "greatnusa",
    displayName: "Great Nusa Mock Up Exam AI-900",
    fileName: "GreatNusaMockUpExamAI900.json",
  },
  {
    name: "ttb1to5",
    displayName: "TTB Part 1 to 5 Questions",
    fileName: "TTBPart1to5.json",
  },
  {
    name: "ttb6to8",
    displayName: "TTB Part 6 to 8 Questions",
    fileName: "TTBPart6to8.json",
  },
  {
    name: "msl1",
    displayName: "MSL1 Questions",
    fileName: "MSL1.json",
  },
  {
    name: "aicsh",
    displayName: "AICSH Questions",
    fileName: "AICSH.json",
  },
  {
    name: "deancyber20",
    displayName: "Dean Cyber 20 Questions",
    fileName: "DeanCyber20.json",
  },
  {
    name: "deancyber50",
    displayName: "Dean Cyber 50 Questions",
    fileName: "DeanCyber50.json",
  },
];

// Question bank data mapping
const questionBankData: { [key: string]: QuizQuestion[] } = {
  isabella: isabellaGithubBank as QuizQuestion[],
  greatnusa: greatNusaMockUpExam as QuizQuestion[],
  ttb1to5: ttbPart1to5 as QuizQuestion[],
  ttb6to8: ttbPart6to8 as QuizQuestion[],
  msl1: msl1 as QuizQuestion[],
  aicsh: aicsh as QuizQuestion[],
  deancyber20: deanCyber20 as QuizQuestion[],
  deancyber50: deanCyber50 as QuizQuestion[],
};

function App() {
  const [appState, setAppState] = useState<AppState>("start");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null
  );

  const handleBankSelection = (bankName: string) => {
    setSelectedBank(bankName);
    setAppState("playing");
  };

  const handleQuizComplete = () => {
    setAppState("completed");
  };

  const handleBackToStart = () => {
    setSelectedBank(null);
    setSelectedAttemptId(null);
    setAppState("start");
  };

  const handleViewHistory = () => {
    setAppState("history");
  };

  const handleViewAttempt = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setAppState("historyDetail");
  };

  const handleBackToHistory = () => {
    setSelectedAttemptId(null);
    setAppState("history");
  };

  const questions = selectedBank ? questionBankData[selectedBank] : [];
  const selectedAttempt = selectedAttemptId
    ? getQuizAttempt(selectedAttemptId)
    : null;

  // Render based on app state
  if (appState === "history") {
    return (
      <HistoryPage
        onBack={handleBackToStart}
        onViewAttempt={handleViewAttempt}
      />
    );
  }

  if (appState === "historyDetail" && selectedAttempt) {
    return (
      <HistoryDetailPage
        attempt={selectedAttempt}
        onBack={handleBackToHistory}
      />
    );
  }

  return (
    <div className="App">
      <Quiz
        questions={questions}
        questionBanks={questionBanks}
        onBankSelect={handleBankSelection}
        onQuizComplete={handleQuizComplete}
        onBackToStart={handleBackToStart}
        onViewHistory={handleViewHistory}
        selectedBank={selectedBank}
        appState={appState}
      />
    </div>
  );
}

export default App;

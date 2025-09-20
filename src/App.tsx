import React, { useState } from "react";
import Quiz from "./components/Quiz";
import { QuizQuestion, QuestionBank } from "./types/quiz";
import isabellaGithubBank from "./data/isabellaGithubBank.json";
import greatNusaMockUpExam from "./data/GreatNusaMockUpExamAI900.json";
import ttbPart1to5 from "./data/TTBPart1to5.json";
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
    name: "ttb",
    displayName: "TTB Part 1 to 5 Questions",
    fileName: "TTBPart1to5.json",
  },
];

// Question bank data mapping
const questionBankData: { [key: string]: QuizQuestion[] } = {
  isabella: isabellaGithubBank as QuizQuestion[],
  greatnusa: greatNusaMockUpExam as QuizQuestion[],
  ttb: ttbPart1to5 as QuizQuestion[],
};

function App() {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const handleBankSelection = (bankName: string) => {
    setSelectedBank(bankName);
  };

  const questions = selectedBank ? questionBankData[selectedBank] : [];

  return (
    <div className="App">
      <Quiz
        questions={questions}
        questionBanks={questionBanks}
        onBankSelect={handleBankSelection}
        selectedBank={selectedBank}
      />
    </div>
  );
}

export default App;

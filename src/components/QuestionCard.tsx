import React, { useState } from "react";
import {
  QuizQuestion,
  QuestionType,
  MatchingAnswer,
  DragDropAnswer,
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
  notes?: string;
  onNotesChange?: (notes: string) => void;
}

/**
 * Utility function to determine the type of a quiz question
 */
const getQuestionType = (question: QuizQuestion): QuestionType => {
  // Check for drag-drop questions with types/scenarios arrays
  if (question.types && question.scenarios && question.correctAnswers) {
    return QuestionType.DRAG_DROP;
  }
  
  // Check for drag-drop questions with principles/requirements arrays
  if (question.principles && question.requirements && question.correctAnswers) {
    return QuestionType.DRAG_DROP;
  }
  
  // Check for drag-drop questions (have correctAnswers array with matching objects)
  if (question.correctAnswers && Array.isArray(question.correctAnswers) && 
      question.correctAnswers.length > 0 && 
      typeof question.correctAnswers[0] === "object") {
    const firstAnswer = question.correctAnswers[0];
    // Check for workload/scenario, principle/requirement, or type/scenario pairs
    if (("workload" in firstAnswer && "scenario" in firstAnswer) ||
        ("principle" in firstAnswer && "requirement" in firstAnswer) ||
        ("type" in firstAnswer && "scenario" in firstAnswer)) {
      return QuestionType.DRAG_DROP;
    }
  }
  
  // Check for Yes/No questions (have correctAnswers array but no options)
  if (question.correctAnswers && !question.options) {
    return QuestionType.YES_NO;
  }
  
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
  notes = "",
  onNotesChange,
}) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<{[key: string]: string}>({});
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

  const renderYesNoQuestion = () => {
    // Parse the question string to extract sub-questions
    const questionText = question.question;
    
    // Split by newlines and filter out the instruction part
    const lines = questionText.split('\n').filter(line => line.trim());
    
    // The first line is usually the instruction, skip it and get the actual statements
    const statements = lines.slice(1).filter(line => line.trim() && !line.startsWith('For each'));
    
    // Create Yes/No options for each statement
    const yesNoOptions = ["Yes", "No"];
    
    return (
      <div className="space-y-6 mb-6 sm:mb-8">
        {statements.map((statement, subIndex) => (
          <div key={subIndex} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white text-sm sm:text-base mb-4 font-medium">
              {subIndex + 1}. {statement.trim()}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {yesNoOptions.map((option, optionIndex) => {
                const fullIndex = subIndex * 2 + optionIndex;
                
                const getYesNoOptionStyle = () => {
                  if (!showAnswers) {
                    return isOptionSelected(fullIndex)
                      ? "bg-blue-600/80 border-blue-400"
                      : "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50";
                  } else {
                    // Show correct answers
                    const correctAnswers = question.correctAnswers as string[];
                    const isCorrect = (optionIndex === 0 && correctAnswers?.[subIndex] === "Yes") || 
                                    (optionIndex === 1 && correctAnswers?.[subIndex] === "No");
                    const isSelected = isOptionSelected(fullIndex);
                    
                    if (isCorrect) {
                      return "bg-green-600/80 border-green-400";
                    } else if (isSelected && !isCorrect) {
                      return "bg-red-600/80 border-red-400";
                    } else {
                      return "bg-gray-700/50 border-gray-600";
                    }
                  }
                };

                const getYesNoOptionIcon = () => {
                  if (!showAnswers) {
                    return (
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          isOptionSelected(fullIndex)
                            ? "border-blue-400 bg-blue-400"
                            : "border-gray-400"
                        }`}
                      >
                        {isOptionSelected(fullIndex) && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    );
                  } else {
                    const correctAnswers = question.correctAnswers as string[];
                    const isCorrect = (optionIndex === 0 && correctAnswers?.[subIndex] === "Yes") || 
                                    (optionIndex === 1 && correctAnswers?.[subIndex] === "No");
                    const isSelected = isOptionSelected(fullIndex);
                    
                    if (isCorrect) {
                      return (
                        <div className="w-4 h-4 rounded-full bg-green-500 mr-3 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      );
                    } else if (isSelected && !isCorrect) {
                      return (
                        <div className="w-4 h-4 rounded-full bg-red-500 mr-3 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✗</span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-500 mr-3"></div>
                      );
                    }
                  }
                };

                return (
                  <button
                    key={optionIndex}
                    onClick={() => !showAnswers && onOptionSelect(fullIndex)}
                    disabled={showAnswers}
                    className={`w-full p-3 text-left rounded-lg border transition-all duration-200 text-white ${getYesNoOptionStyle()} ${
                      showAnswers ? "cursor-default" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      {getYesNoOptionIcon()}
                      <span className="text-sm sm:text-base">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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

  const renderDragDropQuestion = () => {
    const correctAnswers = question.correctAnswers as DragDropAnswer[];

    // Check if question has types/scenarios arrays directly
    let draggableItems: string[] = [];
    let dropTargets: string[] = [];
    let itemLabel = "Items";
    let targetLabel = "Targets";
    let questionFormat = "default";
    
    // Variables for different question formats
    let workloadStartIndex = -1;
    let principleStartIndex = -1;
    let typeStartIndex = -1;
    
    if (question.types && question.scenarios) {
      // Direct arrays format for types/scenarios
      draggableItems = question.types;
      dropTargets = question.scenarios;
      itemLabel = "Learning Types";
      targetLabel = "Definitions";
      questionFormat = "arrays";
    } else if (question.principles && question.requirements) {
      // Direct arrays format for principles/requirements
      draggableItems = question.principles;
      dropTargets = question.requirements;
      itemLabel = "Principles";
      targetLabel = "Requirements";
      questionFormat = "arrays";
    } else {
      // Parse the question to extract items and targets from text
      const questionText = question.question;
      const lines = questionText.split('\n');
      
      // Check if it's a workload/scenario question
      workloadStartIndex = lines.findIndex(line => line.includes('Workloads:'));
      const scenarioStartIndex = lines.findIndex(line => line.includes('Scenarios:'));
      
      // Check if it's a principle/requirement question  
      principleStartIndex = lines.findIndex(line => line.includes('Principles:'));
      const requirementStartIndex = lines.findIndex(line => line.includes('Requirements:'));
      
      // Check if it's a type/scenario question
      typeStartIndex = lines.findIndex(line => line.includes('Types:'));
      const typeScenarioStartIndex = lines.findIndex(line => line.includes('Scenarios:'));
      
      if (workloadStartIndex !== -1 && scenarioStartIndex !== -1) {
        // Workload/Scenario type
        draggableItems = lines.slice(workloadStartIndex + 1, scenarioStartIndex)
          .filter(line => line.trim() && !line.includes('Workloads:'));
        dropTargets = lines.slice(scenarioStartIndex + 1)
          .filter(line => line.trim() && !line.includes('Scenarios:'));
        itemLabel = "AI Workloads";
        targetLabel = "Scenarios";
        questionFormat = "workload";
      } else if (principleStartIndex !== -1 && requirementStartIndex !== -1) {
        // Principle/Requirement type
        draggableItems = lines.slice(principleStartIndex + 1, requirementStartIndex)
          .filter(line => line.trim() && !line.includes('Principles:'));
        dropTargets = lines.slice(requirementStartIndex + 1)
          .filter(line => line.trim() && !line.includes('Requirements:'));
        itemLabel = "Principles";
        targetLabel = "Requirements";
        questionFormat = "principle";
      } else if (typeStartIndex !== -1 && typeScenarioStartIndex !== -1) {
        // Type/Scenario type
        draggableItems = lines.slice(typeStartIndex + 1, typeScenarioStartIndex)
          .filter(line => line.trim() && !line.includes('Types:'));
        dropTargets = lines.slice(typeScenarioStartIndex + 1)
          .filter(line => line.trim() && !line.includes('Scenarios:'));
        itemLabel = "ML Types";
        targetLabel = "Scenarios";
        questionFormat = "type";
      }
    }

    const handleDragStart = (e: React.DragEvent, item: string) => {
      setDraggedItem(item);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, target: string) => {
      e.preventDefault();
      if (draggedItem) {
        const newDropZones = { ...dropZones };
        
        // Remove the item from any existing target
        Object.keys(newDropZones).forEach(key => {
          if (newDropZones[key] === draggedItem) {
            delete newDropZones[key];
          }
        });
        
        // Add to new target
        newDropZones[target] = draggedItem;
        setDropZones(newDropZones);
        
        // Update selected option for validation
        const matches = Object.entries(newDropZones).map(([target, item]) => {
          // Create appropriate format based on question type
          if (questionFormat === "workload") {
            return { workload: item, scenario: target };
          } else if (questionFormat === "principle") {
            return { principle: item, requirement: target };
          } else {
            return { type: item, scenario: target };
          }
        });
        onMatchingSelect?.(matches as any);
      }
      setDraggedItem(null);
    };

    const isItemUsed = (item: string) => {
      return Object.values(dropZones).includes(item);
    };

    const getCorrectMatch = (target: string) => {
      if (questionFormat === "workload") {
        return correctAnswers.find(answer => answer.scenario === target)?.workload;
      } else if (questionFormat === "principle") {
        return correctAnswers.find(answer => answer.requirement === target)?.principle;
      } else {
        return correctAnswers.find(answer => answer.scenario === target)?.type;
      }
    };

    const isCorrectMatch = (target: string, item: string) => {
      return getCorrectMatch(target) === item;
    };

    return (
      <div className="space-y-6 mb-6 sm:mb-8">
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white text-base sm:text-lg font-medium mb-4">
            Drag each {itemLabel.toLowerCase()} to match it with the appropriate {targetLabel.toLowerCase()}:
          </h4>
          
          {/* Draggable Items */}
          <div className="mb-6">
            <h5 className="text-blue-300 font-medium mb-3 text-sm sm:text-base">
              {itemLabel}:
            </h5>
            <div className="flex flex-wrap gap-3">
              {draggableItems.map((item, index) => (
                <div
                  key={index}
                  draggable={!showAnswers && !isItemUsed(item)}
                  onDragStart={(e) => handleDragStart(e, item)}
                  className={`px-4 py-2 rounded-lg border cursor-move transition-all duration-200 text-sm sm:text-base ${
                    !showAnswers && !isItemUsed(item)
                      ? "bg-blue-900/20 border-blue-600/50 text-blue-200 hover:bg-blue-800/30"
                      : isItemUsed(item)
                      ? "bg-gray-600/50 border-gray-500 text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-blue-900/20 border-blue-600/50 text-blue-200"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Drop Zones */}
          <div>
            <h5 className="text-green-300 font-medium mb-3 text-sm sm:text-base">
              {targetLabel}:
            </h5>
            <div className="space-y-3">
              {dropTargets.map((target, index) => (
                <div
                  key={index}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, target)}
                  className={`min-h-[60px] p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
                    !showAnswers
                      ? "border-gray-500 bg-gray-700/30 hover:border-gray-400 hover:bg-gray-600/30"
                      : dropZones[target] && isCorrectMatch(target, dropZones[target])
                      ? "border-green-500 bg-green-900/20"
                      : dropZones[target] && !isCorrectMatch(target, dropZones[target])
                      ? "border-red-500 bg-red-900/20"
                      : "border-gray-500 bg-gray-700/30"
                  }`}
                >
                  <div className="text-gray-200 text-sm sm:text-base mb-2">
                    {target}
                  </div>
                  {dropZones[target] && (
                    <div className={`inline-block px-3 py-1 rounded text-sm ${
                      showAnswers && isCorrectMatch(target, dropZones[target])
                        ? "bg-green-600 text-white"
                        : showAnswers && !isCorrectMatch(target, dropZones[target])
                        ? "bg-red-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}>
                      {dropZones[target]}
                    </div>
                  )}
                  {showAnswers && !dropZones[target] && (
                    <div className="inline-block px-3 py-1 rounded text-sm bg-green-600 text-white">
                      Correct: {getCorrectMatch(target)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isAnswered = () => {
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.MULTI_SELECT:
        return selectedOption !== null;
      case QuestionType.YES_NO:
        return selectedOption !== null;
      case QuestionType.DRAG_DROP:
        return Object.keys(dropZones).length > 0;
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
          {questionType === QuestionType.YES_NO 
            ? question.question.split('\n')[0] // Only show the first line (instruction) for Yes/No questions
            : questionType === QuestionType.DRAG_DROP
            ? question.question.split('\n')[0] // Only show the first line (instruction) for Drag/Drop questions
            : question.question
          }
        </h1>
        {questionType === QuestionType.MULTI_SELECT && (
          <p className="text-blue-300 text-xs sm:text-sm mt-3 sm:mt-4 italic">
            * Select all correct answers for this question
          </p>
        )}
        {questionType === QuestionType.YES_NO && (
          <p className="text-green-300 text-xs sm:text-sm mt-3 sm:mt-4 italic">
            * Select Yes or No for each statement
          </p>
        )}
        {questionType === QuestionType.DRAG_DROP && (
          <p className="text-orange-300 text-xs sm:text-sm mt-3 sm:mt-4 italic">
            * Drag and drop workloads to match with appropriate scenarios
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
        : questionType === QuestionType.YES_NO
        ? renderYesNoQuestion()
        : questionType === QuestionType.DRAG_DROP
        ? renderDragDropQuestion()
        : questionType === QuestionType.MATCHING
        ? renderMatchingQuestion()
        : renderFillInBlankQuestion()}

      {/* Notes Section */}
      <div className="mt-6 p-4 bg-gray-800/30 border border-gray-600 rounded-lg">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
          Personal Notes (optional):
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange?.(e.target.value)}
          placeholder="Add your own notes about this question to help you remember later..."
          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          rows={3}
        />
      </div>

      <div className="flex justify-end mt-4">
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

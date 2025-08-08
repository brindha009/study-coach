"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { BookOpen, Brain, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  subject: string
  questions: QuizQuestion[]
}

export default function QuizPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchQuizzes()
    }
  }, [session])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes")
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes)
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    }
  }

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer) {
      const currentQuestion = currentQuiz?.questions[currentQuestionIndex]
      if (currentQuestion && selectedAnswer === currentQuestion.correctAnswer) {
        setScore(score + 1)
      }
      
      if (currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setShowExplanation(false)
      } else {
        // Quiz completed
        const finalScore = selectedAnswer === currentQuestion?.correctAnswer ? score + 1 : score
        const percentage = Math.round((finalScore / (currentQuiz?.questions.length || 1)) * 100)
        // Save quiz attempt
        saveQuizAttempt(percentage)
      }
    }
  }

  const saveQuizAttempt = async (percentage: number) => {
    if (!currentQuiz || !session?.user?.id) return

    try {
      await fetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: currentQuiz.id,
          userId: session.user.id,
          score: percentage,
        }),
      })
    } catch (error) {
      console.error("Error saving quiz attempt:", error)
    }
  }

  const generateQuiz = async (subject: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuizzes(prev => [data.quiz, ...prev])
      }
    } catch (error) {
      console.error("Error generating quiz:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    router.push("/")
    return null
  }

  if (currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <button
                onClick={() => setCurrentQuiz(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Quizzes</span>
              </button>
              <div className="flex items-center space-x-3">
                <Brain className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">{currentQuiz.title}</h1>
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </div>
            </div>
          </div>
        </header>

        {/* Quiz Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      selectedAnswer === option
                        ? selectedAnswer === currentQuestion.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    disabled={selectedAnswer !== null}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {selectedAnswer === option && (
                          selectedAnswer === currentQuestion.correctAnswer ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedAnswer && (
              <div className="mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Explanation</h3>
                  <p className="text-blue-800">{currentQuestion.explanation}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLastQuestion ? "Finish Quiz" : "Next Question"}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  <p className="text-sm text-gray-600">{quiz.subject}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {quiz.questions.length} questions
              </p>
              <button
                onClick={() => startQuiz(quiz)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start Quiz
              </button>
            </div>
          ))}

          {/* Generate New Quiz */}
          <div className="bg-white rounded-xl shadow-sm border p-6 border-dashed border-gray-300">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Generate New Quiz</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a quiz from your study materials
              </p>
              <button
                onClick={() => generateQuiz("Biology")}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Generating..." : "Generate Quiz"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { Upload, BookOpen, Brain, Calendar, Target, Trophy } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { data: session, status } = useSession()
  const [isUploading, setIsUploading] = useState(false)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your study dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Coach AI</h1>
            <p className="text-gray-600 mb-8">Your personal AI learning assistant</p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
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
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Study Coach AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session.user?.name}</span>
              <Link
                href="/api/auth/signout"
                className="text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/upload"
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Upload Study Material</h3>
                <p className="text-sm text-gray-600">Add notes, textbooks, or articles</p>
              </div>
            </div>
          </Link>

          <Link
            href="/study-plan"
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Study Plan</h3>
                <p className="text-sm text-gray-600">Get a personalized study schedule</p>
              </div>
            </div>
          </Link>

          <Link
            href="/quiz"
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Take a Quiz</h3>
                <p className="text-sm text-gray-600">Test your knowledge</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Materials</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quizzes Taken</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Hours</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Uploaded Biology Notes</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Completed Math Study Plan</p>
                <p className="text-sm text-gray-600">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Scored 85% on Chemistry Quiz</p>
                <p className="text-sm text-gray-600">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

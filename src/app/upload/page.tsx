"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Upload, FileText, BookOpen, Brain, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [materialData, setMaterialData] = useState({
    title: "",
    subject: "",
    type: "notes",
    content: ""
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setIsUploading(true)

    // Simulate file processing
    setTimeout(() => {
      setIsUploading(false)
      // In a real app, you'd process the file content here
      setMaterialData(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ""),
        content: "Sample content from uploaded file..."
      }))
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setIsUploading(true)

    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...materialData,
          userId: session.user.id,
        }),
      })

      if (response.ok) {
        router.push("/")
      }
    } catch (error) {
      console.error("Error uploading material:", error)
    } finally {
      setIsUploading(false)
    }
  }

  if (!session) {
    router.push("/")
    return null
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
              <h1 className="text-2xl font-bold text-gray-900">Upload Study Material</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Your Study Material</h2>
            <p className="text-gray-600">Upload notes, textbooks, or articles to get AI-powered insights</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  ) : (
                    <FileText className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX, or TXT files up to 10MB
                </p>
              </label>
            </div>

            {/* Material Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={materialData.title}
                  onChange={(e) => setMaterialData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Biology Chapter 5 Notes"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={materialData.subject}
                  onChange={(e) => setMaterialData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Biology, Math, History"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Material Type
              </label>
              <select
                id="type"
                value={materialData.type}
                onChange={(e) => setMaterialData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="notes">Class Notes</option>
                <option value="textbook">Textbook Chapter</option>
                <option value="article">Article or Paper</option>
                <option value="handout">Handout</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* AI Processing Preview */}
            {uploadedFile && (
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">AI Analysis Preview</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Summary:</span>
                    <span className="text-gray-900">This material covers key concepts in...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Key Topics:</span>
                    <span className="text-gray-900">5 topics identified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="text-gray-900">Intermediate</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isUploading || !uploadedFile}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? "Processing..." : "Upload & Analyze"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

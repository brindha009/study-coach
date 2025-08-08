import { AIStudyService } from "@/lib/ai"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subject } = body

    // Get study materials for the subject
    const materials = await prisma.studyMaterial.findMany({
      where: {
        userId: session.user.id,
        subject: subject || "Biology", // Default to Biology for demo
      },
      orderBy: { uploadedAt: "desc" },
      take: 3, // Use the 3 most recent materials
    })

    if (materials.length === 0) {
      // For demo, create a mock quiz even without materials
      const mockQuiz = await prisma.quiz.create({
        data: {
          title: `${subject || "Biology"} Quiz`,
          subject: subject || "Biology",
          userId: session.user.id,
          questions: {
            create: [
              {
                question: "What is the main topic covered in this subject?",
                options: JSON.stringify([
                  "Advanced mathematics",
                  "Basic concepts",
                  "Historical events",
                  "Scientific principles"
                ]),
                correctAnswer: "Basic concepts",
                explanation: "The material focuses on fundamental concepts and principles."
              },
              {
                question: "Which of the following is most important for understanding this subject?",
                options: JSON.stringify([
                  "Memorization",
                  "Critical thinking",
                  "Speed reading",
                  "Note taking"
                ]),
                correctAnswer: "Critical thinking",
                explanation: "Critical thinking is essential for understanding complex concepts."
              }
            ]
          },
        },
        include: {
          questions: true,
        },
      })

      // Parse JSON strings for response
      const parsedQuiz = {
        ...mockQuiz,
        questions: mockQuiz.questions.map(q => ({
          ...q,
          options: q.options ? JSON.parse(q.options) : []
        }))
      }

      return NextResponse.json({ quiz: parsedQuiz })
    }

    // Combine content from materials
    const combinedContent = materials
      .map(m => `${m.title}: ${m.content}`)
      .join("\n\n")

    // Generate quiz using AI
    const aiQuiz = await AIStudyService.generateQuiz(combinedContent, subject || "Biology", 5)

    if (!aiQuiz || !aiQuiz.questions) {
      return NextResponse.json(
        { error: "Failed to generate quiz" },
        { status: 500 }
      )
    }

    // Create quiz in database
    const quiz = await prisma.quiz.create({
      data: {
        title: `${subject || "Biology"} Quiz`,
        subject: subject || "Biology",
        userId: session.user.id,
        questions: {
          create: aiQuiz.questions.map((q: any) => ({
            question: q.question,
            options: q.options, // Already JSON string from AI service
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
      include: {
        questions: true,
      },
    })

    // Parse JSON strings for response
    const parsedQuiz = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : []
      }))
    }

    return NextResponse.json({ quiz: parsedQuiz })
  } catch (error) {
    console.error("Error generating quiz:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quizzes = await prisma.quiz.findMany({
      where: { userId: session.user.id },
      include: {
        questions: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Parse JSON strings for frontend
    const parsedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : []
      }))
    }))

    return NextResponse.json({ quizzes: parsedQuizzes })
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, subject, questions } = body

    if (!title || !subject || !questions) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        subject,
        userId: session.user.id,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            options: JSON.stringify(q.options),
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
    console.error("Error creating quiz:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

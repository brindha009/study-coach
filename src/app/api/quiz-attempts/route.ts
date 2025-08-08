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
    const { quizId, userId, score, answers } = body

    if (!quizId || !userId || score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Save quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        answers: JSON.stringify(answers || {}),
      },
    })

    // Update or create progress record
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { subject: true },
    })

    if (quiz) {
      await prisma.progress.upsert({
        where: {
          userId_subject: {
            userId: session.user.id,
            subject: quiz.subject,
          },
        },
        update: {
          score: Math.max(score, 0), // Keep the higher score
          lastStudied: new Date(),
        },
        create: {
          userId: session.user.id,
          subject: quiz.subject,
          score,
          lastStudied: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, quizAttempt })
  } catch (error) {
    console.error("Error saving quiz attempt:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

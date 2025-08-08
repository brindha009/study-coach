import { AIStudyService, generateEmbedding } from "@/lib/ai"
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
    const { title, content, subject, type, userId } = body

    if (!title || !content || !subject || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Process the material with AI
    const aiAnalysis = await AIStudyService.processStudyMaterial(content)
    
    // Generate embedding for search
    const embedding = await generateEmbedding(content)

    // Save to database
    const material = await prisma.studyMaterial.create({
      data: {
        title,
        content,
        subject,
        type,
        userId,
        summary: aiAnalysis?.summary || null,
        keyTopics: aiAnalysis?.keyTopics || null,
        difficulty: aiAnalysis?.difficulty || null,
        embedding: embedding || null,
      },
    })

    return NextResponse.json({ success: true, material })
  } catch (error) {
    console.error("Error creating study material:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subject = searchParams.get("subject")

    const where = {
      userId: session.user.id,
      ...(subject && { subject }),
    }

    const materials = await prisma.studyMaterial.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
    })

    return NextResponse.json({ materials })
  } catch (error) {
    console.error("Error fetching study materials:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize AI clients (with fallback for demo)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-key",
})

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "demo-key")

// AI Service for Study Material Processing
export class AIStudyService {
  // Generate summary and key topics from study material
  static async processStudyMaterial(content: string) {
    try {
      // Demo mode - return mock data if no API key
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "demo-key") {
        return {
          summary: "This study material covers key concepts in the subject area with important topics and definitions.",
          keyTopics: JSON.stringify(["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]),
          difficulty: "intermediate"
        }
      }

      const prompt = `
        Analyze the following study material and provide:
        1. A concise summary (2-3 sentences)
        2. 5-8 key topics as a JSON array
        3. Difficulty level (beginner/intermediate/advanced)
        
        Study material:
        ${content}
        
        Respond in JSON format:
        {
          "summary": "brief summary",
          "keyTopics": ["topic1", "topic2", ...],
          "difficulty": "beginner|intermediate|advanced"
        }
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      })

      const response = completion.choices[0]?.message?.content
      const parsed = response ? JSON.parse(response) : null
      
      if (parsed) {
        return {
          ...parsed,
          keyTopics: JSON.stringify(parsed.keyTopics || [])
        }
      }
      
      return null
    } catch (error) {
      console.error("Error processing study material:", error)
      return {
        summary: "This study material covers key concepts in the subject area.",
        keyTopics: JSON.stringify(["Topic 1", "Topic 2", "Topic 3"]),
        difficulty: "intermediate"
      }
    }
  }

  // Generate quiz questions from study material
  static async generateQuiz(content: string, subject: string, numQuestions: number = 5) {
    try {
      // Demo mode - return mock quiz if no API key
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "demo-key") {
        return {
          questions: [
            {
              question: "What is the main topic covered in this material?",
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
        }
      }

      const prompt = `
        Create ${numQuestions} multiple choice questions based on this study material.
        Subject: ${subject}
        
        Study material:
        ${content}
        
        For each question, provide:
        - The question text
        - 4 multiple choice options (A, B, C, D)
        - The correct answer (A, B, C, or D)
        - A brief explanation of why the answer is correct
        
        Respond in JSON format:
        {
          "questions": [
            {
              "question": "question text",
              "options": ["option A", "option B", "option C", "option D"],
              "correctAnswer": "A",
              "explanation": "explanation"
            }
          ]
        }
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content
      const parsed = response ? JSON.parse(response) : null
      
      if (parsed && parsed.questions) {
        return {
          questions: parsed.questions.map((q: any) => ({
            ...q,
            options: JSON.stringify(q.options)
          }))
        }
      }
      
      return null
    } catch (error) {
      console.error("Error generating quiz:", error)
      return {
        questions: [
          {
            question: "What is the main topic covered in this material?",
            options: JSON.stringify([
              "Advanced mathematics",
              "Basic concepts", 
              "Historical events",
              "Scientific principles"
            ]),
            correctAnswer: "Basic concepts",
            explanation: "The material focuses on fundamental concepts and principles."
          }
        ]
      }
    }
  }

  // Generate personalized study plan
  static async generateStudyPlan(
    materials: Array<{ title: string; content: string; subject: string }>,
    duration: number = 7
  ) {
    try {
      // Demo mode - return mock study plan
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "demo-key") {
        return {
          title: "7-Day Study Plan",
          description: "A personalized study schedule based on your materials",
          tasks: [
            {
              title: "Day 1: Review Key Concepts",
              description: "Read through the main topics and take notes",
              estimatedTime: 60,
              method: "reading"
            },
            {
              title: "Day 2: Practice Problems",
              description: "Work on practice questions and exercises",
              estimatedTime: 45,
              method: "practice"
            },
            {
              title: "Day 3: Quiz Preparation",
              description: "Review and prepare for upcoming quizzes",
              estimatedTime: 30,
              method: "review"
            }
          ]
        }
      }

      const materialsText = materials
        .map((m) => `${m.title} (${m.subject}): ${m.content.substring(0, 500)}...`)
        .join("\n\n")

      const prompt = `
        Create a ${duration}-day study plan based on these materials:
        ${materialsText}
        
        For each day, provide:
        - A specific task or topic to focus on
        - Estimated time (30-120 minutes)
        - Study method (reading, practice problems, review, etc.)
        
        Respond in JSON format:
        {
          "title": "Study Plan Title",
          "description": "Brief description",
          "tasks": [
            {
              "title": "Day 1: Topic",
              "description": "What to do",
              "estimatedTime": 60,
              "method": "reading|practice|review"
            }
          ]
        }
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      })

      const response = completion.choices[0]?.message?.content
      return response ? JSON.parse(response) : null
    } catch (error) {
      console.error("Error generating study plan:", error)
      return {
        title: "7-Day Study Plan",
        description: "A personalized study schedule based on your materials",
        tasks: [
          {
            title: "Day 1: Review Key Concepts",
            description: "Read through the main topics and take notes",
            estimatedTime: 60,
            method: "reading"
          }
        ]
      }
    }
  }

  // Answer questions with context from study materials
  static async answerQuestion(question: string, context: string) {
    try {
      // Demo mode - return mock answer
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "demo-key") {
        return "Based on the study material, this question relates to key concepts covered in the content. The material provides important information that helps answer this question effectively."
      }

      const prompt = `
        Answer the following question based on the provided study material.
        If the answer cannot be found in the material, say so.
        
        Study material:
        ${context}
        
        Question: ${question}
        
        Provide a clear, educational answer with specific references to the material.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      })

      return completion.choices[0]?.message?.content || "I couldn't find an answer to that question."
    } catch (error) {
      console.error("Error answering question:", error)
      return "Sorry, I encountered an error while processing your question."
    }
  }
}

// Utility functions
export const generateEmbedding = async (text: string): Promise<string> => {
  try {
    // Demo mode - return mock embedding
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "demo-key") {
      return JSON.stringify([0.1, 0.2, 0.3, 0.4, 0.5])
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })
    return JSON.stringify(response.data[0].embedding)
  } catch (error) {
    console.error("Error generating embedding:", error)
    return JSON.stringify([0.1, 0.2, 0.3, 0.4, 0.5])
  }
}

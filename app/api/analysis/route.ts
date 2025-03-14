import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'

// Ensure the environment variable is set
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable')
}

// Create Google provider with API key from environment variable
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export const maxDuration = 30 // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        // Use Google's Gemini model with proper configuration
        const result = streamText({
            model: google('gemini-2.0-flash'),
            messages,
            temperature: 1,
            maxTokens: 1500,
        })

        return result.toDataStreamResponse()
    } catch (error) {
        console.error('Error in analysis API:', error)
        return new Response(JSON.stringify({ error: 'Failed to process your request' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
}
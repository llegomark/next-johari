'use client'

import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { useJohari } from './JohariProvider'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function JohariAnalysis() {
    const { johariData, analysis, setAnalysis } = useJohari()

    // Use the useChat hook to handle streaming
    const { messages, append, isLoading, error, setMessages } = useChat({
        api: '/api/analysis',
        onFinish: (message) => {
            // Save the final message to the Johari provider for persistence
            setAnalysis(message.content)
        },
    })

    // Get the latest assistant message for display
    const currentAnalysis = messages
        .filter(message => message.role === 'assistant')
        .pop()?.content || analysis

    // Generate and stream the analysis
    const generateAnalysis = () => {
        if (
            !johariData.openSelf ||
            !johariData.blindSelf ||
            !johariData.hiddenSelf ||
            !johariData.unknownSelf
        ) {
            alert('Please fill in all quadrants of the Johari Window before generating an analysis.')
            return
        }

        // Clear existing messages to start fresh
        setMessages([])

        // Create the prompt
        const prompt = `
      As a leadership coach for school principals in the Philippines, analyze this Johari Window data:
      
      Open Self (Known to self and others):
      ${johariData.openSelf}
      
      Blind Self (Unknown to self, known to others):
      ${johariData.blindSelf}
      
      Hidden Self (Known to self, unknown to others):
      ${johariData.hiddenSelf}
      
      Unknown Self (Unknown to self and others):
      ${johariData.unknownSelf}
      
      Based on this Johari Window data for a school leader in the Philippines:
      1. Provide a brief assessment of their leadership profile
      2. Identify key strengths and growth areas
      3. Suggest specific and actionable steps to improve self-awareness
      4. Recommend professional development priorities
      5. Explain how this self-awareness can improve their effectiveness as a school leader
      
      Format your response with markdown including headings, bullet points, and numbered lists where appropriate.
    `

        // Send the prompt - this will automatically start streaming the response
        append({
            role: 'user',
            content: prompt,
        })
    }

    // Convert markdown to HTML for display with DOMPurify sanitization
    const renderMarkdown = (text: string) => {
        try {
            // First parse markdown to HTML
            // Use marked.parse with a type assertion to handle the string | Promise<string> issue
            const parsed = marked.parse(text);

            // Handle both synchronous and asynchronous cases
            if (typeof parsed === 'string') {
                // Synchronous result - sanitize and return immediately
                const sanitizedHtml = DOMPurify.sanitize(parsed, {
                    USE_PROFILES: { html: true },
                    FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed'],
                    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
                    ADD_ATTR: ['target'],
                    ALLOW_DATA_ATTR: false
                });

                return { __html: sanitizedHtml };
            } else {
                // If it's a promise (which should be rare with default configuration),
                // just return the original text for now
                console.error('Async markdown parsing is not supported in this component');
                return { __html: text };
            }
        } catch (error) {
            console.error('Error parsing or sanitizing markdown:', error);
            return { __html: text };
        }
    }

    // Error state
    if (error) {
        return (
            <div className="h-full flex flex-col">
                <h3 className="text-xl font-medium mb-4">AI Analysis & Feedback</h3>
                <Card className="flex-1 p-6">
                    <div className="text-red-600">
                        Error generating analysis. Please try again later.
                    </div>
                    <Button
                        onClick={() => setMessages([])}
                        variant="outline"
                        className="mt-4"
                    >
                        Try Again
                    </Button>
                </Card>
            </div>
        )
    }

    // Initial state - no analysis yet
    if (!currentAnalysis && !isLoading) {
        return (
            <div className="h-full flex flex-col">
                <h3 className="text-xl font-medium mb-4">AI Analysis & Feedback</h3>

                <Card className="flex-1">
                    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
                        <CardTitle className="text-xl mb-3">Get AI-Powered Insights</CardTitle>
                        <CardDescription className="mb-6 max-w-md">
                            Generate a personalized analysis based on your Johari Window data
                        </CardDescription>
                        <Button
                            onClick={generateAnalysis}
                            disabled={isLoading}
                            size="lg"
                        >
                            Generate Analysis
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    // Streaming or completed state
    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-medium mb-4">AI Analysis & Feedback</h3>

            <Card className="flex-1">
                <CardContent className="pt-3 px-6 pb-6 h-full overflow-auto">
                    <div className="prose prose-lg prose-headings:font-bold prose-headings:text-black dark:prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-3 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-li:ml-4 max-w-none">
                        <article
                            className="markdown-content mt-0"
                            dangerouslySetInnerHTML={renderMarkdown(currentAnalysis)}
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={() => {
                                setMessages([])
                                setAnalysis('')
                            }}
                            variant="outline"
                        >
                            Generate New Analysis
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
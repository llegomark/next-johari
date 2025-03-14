'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { useJohari } from './JohariProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function JohariAnalysis() {
    const { johariData, analysis, setAnalysis } = useJohari()
    const [generating, setGenerating] = useState(false)

    const { append } = useChat({
        api: '/api/analysis',
        onFinish: (message) => {
            setGenerating(false)
            if (message.role === 'assistant') {
                const assistantMessage = message.parts?.find(part => part.type === 'text')?.text || ''
                setAnalysis(assistantMessage)
            }
        },
    })

    const generateAnalysis = async () => {
        if (
            !johariData.openSelf ||
            !johariData.blindSelf ||
            !johariData.hiddenSelf ||
            !johariData.unknownSelf
        ) {
            alert('Please fill in all quadrants of the Johari Window before generating an analysis.')
            return
        }

        setGenerating(true)

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
      
      Format your response with clear headings and bullet points where appropriate.
    `

        try {
            await append({
                role: 'user',
                content: prompt,
            })
        } catch (error) {
            console.error('Error generating analysis:', error)
            setGenerating(false)
        }
    }

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-medium mb-4">AI Analysis & Feedback</h3>

            {!analysis && (
                <Card className="flex-1 flex flex-col justify-center items-center p-8 text-center gap-4">
                    <CardHeader className="p-0">
                        <CardTitle>Get AI-Powered Insights</CardTitle>
                        <CardDescription>
                            Generate a personalized analysis based on your Johari Window data
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Button
                            onClick={generateAnalysis}
                            disabled={generating}
                            className="mt-4"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing your data...
                                </>
                            ) : (
                                'Generate Analysis'
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {analysis && (
                <div className="flex-1 overflow-auto">
                    <Card className="h-full">
                        <CardContent className="p-6 h-full overflow-auto">
                            <div className="prose prose-zinc dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>') }} />
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    onClick={() => {
                                        setAnalysis('')
                                        setGenerating(false)
                                    }}
                                    variant="outline"
                                >
                                    Generate New Analysis
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
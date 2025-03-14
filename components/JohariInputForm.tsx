'use client'

import { useJohari } from './JohariProvider'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'

export function JohariInputForm() {
    const { johariData, updateJohariData } = useJohari()

    const handleChange = (field: keyof typeof johariData, value: string) => {
        updateJohariData(field, value)
    }

    return (
        <div className="space-y-8">
            <div className="mb-6">
                <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>About the Johari Window</AlertTitle>
                    <AlertDescription>
                        The Johari Window is a tool for self-reflection and understanding how others perceive you.
                        Input your thoughts for each quadrant below, then view the 3D visualization and AI analysis.
                    </AlertDescription>
                </Alert>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label htmlFor="openSelf" className="text-lg font-medium">
                        Open Self (Known to self and others)
                    </Label>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Leadership qualities, skills, and behaviors that both you and others recognize.
                    </p>
                    <Textarea
                        id="openSelf"
                        placeholder="e.g., Communication skills, decision-making abilities, professional knowledge..."
                        className="h-32"
                        value={johariData.openSelf}
                        onChange={(e) => handleChange('openSelf', e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <Label htmlFor="blindSelf" className="text-lg font-medium">
                        Blind Self (Unknown to self, known to others)
                    </Label>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Behaviors or traits that others observe but you may not recognize in yourself.
                    </p>
                    <Textarea
                        id="blindSelf"
                        placeholder="e.g., Impact of your decisions, unintentional biases, communication style effects..."
                        className="h-32"
                        value={johariData.blindSelf}
                        onChange={(e) => handleChange('blindSelf', e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <Label htmlFor="hiddenSelf" className="text-lg font-medium">
                        Hidden Self (Known to self, unknown to others)
                    </Label>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Thoughts, feelings, or motivations you don&apos;t typically share with your team or stakeholders.
                    </p>
                    <Textarea
                        id="hiddenSelf"
                        placeholder="e.g., Career ambitions, personal challenges, concerns about programs..."
                        className="h-32"
                        value={johariData.hiddenSelf}
                        onChange={(e) => handleChange('hiddenSelf', e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <Label htmlFor="unknownSelf" className="text-lg font-medium">
                        Unknown Self (Unknown to self and others)
                    </Label>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Potential, undiscovered talents, or areas for growth that neither you nor others are aware of yet.
                    </p>
                    <Textarea
                        id="unknownSelf"
                        placeholder="e.g., Untapped leadership potential, hidden talents, future growth areas..."
                        className="h-32"
                        value={johariData.unknownSelf}
                        onChange={(e) => handleChange('unknownSelf', e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Complete all quadrants to get the most accurate visualization and AI analysis.
                <br />
                Switch to the Visualization tab to see your Johari Window in 3D and receive AI-powered insights.
            </div>
        </div>
    )
}
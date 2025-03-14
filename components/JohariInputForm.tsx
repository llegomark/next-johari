'use client'

import { useJohari } from './JohariProvider'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { InfoIcon, Eye, FileText } from 'lucide-react'
import { useState } from 'react'

// Sample data for pre-filling
const SAMPLE_DATA = {
    openSelf: "Effective communication skills, Curriculum knowledge, Organized planning, Transparent leadership style, Attention to detail",
    blindSelf: "Occasional micromanagement, Reluctance to delegate, Impatience with slow progress, Tendency to overwork, Impact of tone on staff morale",
    hiddenSelf: "Career ambitions for higher positions, Concerns about budget limitations, Personal stress management challenges, Uncertainty about new policies, Feelings of impostor syndrome",
    unknownSelf: "Potential for mentoring other administrators, Untapped innovation skills, Capacity for international educational partnerships, Ability to influence education policy, Talent for creative problem-solving"
}

export function JohariInputForm({ onDataEntered }: { onDataEntered?: () => void }) {
    const { johariData, updateJohariData } = useJohari()
    const [showTips, setShowTips] = useState(false)

    const handleChange = (field: keyof typeof johariData, value: string) => {
        updateJohariData(field, value)
    }

    // Check if all fields have content
    const allFieldsHaveContent = Object.values(johariData).every(value => value.trim() !== '')
    const anyFieldHasContent = Object.values(johariData).some(value => value.trim() !== '')

    // Handle "View in 3D" button click
    const handleViewIn3D = () => {
        if (onDataEntered) onDataEntered()
    }

    // Pre-fill all fields with sample data
    const handlePreFill = () => {
        Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
            updateJohariData(key as keyof typeof johariData, value)
        })
    }

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>About the Johari Window</AlertTitle>
                    <AlertDescription>
                        The Johari Window is a self-awareness tool used by school leaders to understand how they&apos;re perceived.
                        <span className="block mt-2 font-medium">For best results:</span>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Add multiple items in each quadrant, separated by commas</li>
                            <li>Example: Communication skills, Teamwork, Leadership</li>
                            <li>Each comma-separated item will appear in the 3D visualization</li>
                        </ul>
                    </AlertDescription>
                </Alert>

                <div className="flex justify-between mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreFill}
                        title="Fill with sample data"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        {anyFieldHasContent ? "Replace with sample data" : "Fill with sample data"}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTips(!showTips)}
                    >
                        {showTips ? 'Hide Tips' : 'Show Tips'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="openSelf" className="text-base font-medium">
                            Open Self
                        </Label>
                        <span className="text-xs text-muted-foreground">Known to self & others</span>
                    </div>
                    {showTips && (
                        <Alert variant="default" className="py-2 px-3 bg-muted/50">
                            <AlertDescription className="text-xs">
                                Professional qualities others can observe: communication style, technical knowledge, leadership approach
                            </AlertDescription>
                        </Alert>
                    )}
                    <Textarea
                        id="openSelf"
                        placeholder="Add items separated by commas"
                        className="h-28 resize-none"
                        value={johariData.openSelf}
                        onChange={(e) => handleChange('openSelf', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="blindSelf" className="text-base font-medium">
                            Blind Self
                        </Label>
                        <span className="text-xs text-muted-foreground">Unknown to self, known to others</span>
                    </div>
                    {showTips && (
                        <Alert variant="default" className="py-2 px-3 bg-muted/50">
                            <AlertDescription className="text-xs">
                                What others might observe: impact of decisions, communication effects, unintentional biases
                            </AlertDescription>
                        </Alert>
                    )}
                    <Textarea
                        id="blindSelf"
                        placeholder="Add items separated by commas"
                        className="h-28 resize-none"
                        value={johariData.blindSelf}
                        onChange={(e) => handleChange('blindSelf', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="hiddenSelf" className="text-base font-medium">
                            Hidden Self
                        </Label>
                        <span className="text-xs text-muted-foreground">Known to self, unknown to others</span>
                    </div>
                    {showTips && (
                        <Alert variant="default" className="py-2 px-3 bg-muted/50">
                            <AlertDescription className="text-xs">
                                What you don&apos;t share: career ambitions, personal challenges, concerns about programs
                            </AlertDescription>
                        </Alert>
                    )}
                    <Textarea
                        id="hiddenSelf"
                        placeholder="Add items separated by commas"
                        className="h-28 resize-none"
                        value={johariData.hiddenSelf}
                        onChange={(e) => handleChange('hiddenSelf', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="unknownSelf" className="text-base font-medium">
                            Unknown Self
                        </Label>
                        <span className="text-xs text-muted-foreground">Unknown to self & others</span>
                    </div>
                    {showTips && (
                        <Alert variant="default" className="py-2 px-3 bg-muted/50">
                            <AlertDescription className="text-xs">
                                Potential areas: untapped leadership abilities, hidden talents, future growth areas
                            </AlertDescription>
                        </Alert>
                    )}
                    <Textarea
                        id="unknownSelf"
                        placeholder="Add items separated by commas"
                        className="h-28 resize-none"
                        value={johariData.unknownSelf}
                        onChange={(e) => handleChange('unknownSelf', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <Button
                    onClick={handleViewIn3D}
                    disabled={!allFieldsHaveContent}
                    size="lg"
                    className="w-full sm:w-auto"
                >
                    <Eye className="mr-2 h-4 w-4" />
                    View in 3D
                </Button>

                {!allFieldsHaveContent && (
                    <p className="text-sm text-muted-foreground text-center">
                        Please fill all quadrants to enable 3D visualization
                    </p>
                )}
            </div>
        </div>
    )
}
'use client'

import { useJohari } from './JohariProvider'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { InfoIcon, Eye, FileText, ChevronDown, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data for different types of principals
const PRINCIPAL_PROFILES = {
    newPrincipal: {
        label: "New/Early Career Principal",
        openSelf: "Educational background in curriculum, Daily operations management, Tech savvy, Enthusiasm for new initiatives, Staff meeting facilitation",
        blindSelf: "Hesitancy when making difficult decisions, Tendency to avoid conflict, Stress signals visible to staff, Overpromising on timeframes, Reliance on formal authority rather than earned respect",
        hiddenSelf: "Feelings of inadequacy compared to predecessor, Concerns about teacher evaluation accuracy, Uncertainty about budget procedures, Worry about parent perception, Personal life balance struggles",
        unknownSelf: "Potential for innovative scheduling approaches, Natural mediating abilities, Capacity for mentoring middle managers, Talent for building business partnerships, Leadership presence during crises"
    },
    experiencedPrincipal: {
        label: "Experienced Principal",
        openSelf: "Extensive policy knowledge, Calm crisis management, Strategic planning expertise, Professional network connections, Mastery of educational regulations",
        blindSelf: "Resistance to new methodologies, Occasional dismissiveness of young staff ideas, Set routines that limit flexibility, Communication style perceived as terse, Power dynamics in leadership team",
        hiddenSelf: "Burnout concerns, Disagreement with certain district policies, Career plateau frustrations, Concerns about succession planning, Political considerations in decision-making",
        unknownSelf: "Potential as an educational author/speaker, Untapped coaching abilities, Capacity for system-level leadership, Cross-cultural educational innovation skills, Adaptability to emerging educational technologies"
    },
    transformationalPrincipal: {
        label: "Transformational Leader Principal",
        openSelf: "Visionary goal-setting, Change management expertise, Motivational communication style, Professional development advocacy, Innovation mindset",
        blindSelf: "Setting overwhelming pace for staff, Creating initiative fatigue, Underestimating transition difficulties, Impatience with traditional approaches, Leaving some staff feeling inadequate",
        hiddenSelf: "Uncertainty about long-term sustainability of changes, Personal investment in specific initiatives, Doubts about resistance management, Concerns about measuring impact, Future career aspirations",
        unknownSelf: "Scaling successful innovations to system level, Potential to influence national education policy, Capacity for research partnerships, Talent for educational technology development, Skills for cross-sector collaboration"
    },
    communityPrincipal: {
        label: "Community-Focused Principal",
        openSelf: "Parent engagement strategies, Cultural sensitivity, Community resource knowledge, Public speaking skills, Relationship-building expertise",
        blindSelf: "Internal administrative details sometimes overlooked, Less focus on academic metrics, Time management challenges, Uneven attention to different community segments, Decision delays seeking consensus",
        hiddenSelf: "Frustration with district PR limitations, Concerns about balancing diverse community needs, Difficulty navigating competing stakeholder demands, Exhaustion from community events, Worries about student privacy",
        unknownSelf: "Potential for nonprofit leadership, Grant writing abilities, Capacity for developing multi-generational programs, Social entrepreneurship skills, Talent for public-private partnerships"
    },
    dataDrivenPrincipal: {
        label: "Data-Driven Principal",
        openSelf: "Assessment analysis skills, Evidence-based decision making, Strategic resource allocation, Performance tracking systems, Detailed improvement planning",
        blindSelf: "Over-reliance on quantitative measures, Creating anxiety around metrics, Missing emotional/social factors, Communication perceived as impersonal, Impact on teacher creativity",
        hiddenSelf: "Concerns about data validity, Frustration with district data requirements, Uncertainty about balancing qualitative inputs, Worries about reducing education to numbers, Pressure to show continuous improvement",
        unknownSelf: "Potential for developing holistic evaluation frameworks, Capacity for educational research design, Ability to personalize learning through analytics, Talent for predictive educational modeling, Skills for communicating data meaningfully"
    }
}

export function JohariInputForm({ onDataEntered }: { onDataEntered?: () => void }) {
    const { johariData, updateJohariData } = useJohari()
    const [showTips, setShowTips] = useState(false)
    const [selectedProfile, setSelectedProfile] = useState<string>("")
    const [activeTab, setActiveTab] = useState<string>("info")

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

    // Pre-fill fields based on selected profile
    const handleProfileSelect = (value: string) => {
        setSelectedProfile(value)
        if (value && PRINCIPAL_PROFILES[value as keyof typeof PRINCIPAL_PROFILES]) {
            const profile = PRINCIPAL_PROFILES[value as keyof typeof PRINCIPAL_PROFILES]
            Object.entries(profile).forEach(([key, value]) => {
                if (key !== 'label' && typeof value === 'string') {
                    updateJohariData(key as keyof typeof johariData, value)
                }
            })
        }
    }

    return (
        <div className="space-y-8">
            {/* Header with tabs for information and sample data */}
            <div className="starting:translate-y-2 starting:opacity-0 animate-fade-in">
                <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6">
                        <TabsTrigger value="info" className="text-base">Johari Window Information</TabsTrigger>
                        <TabsTrigger value="samples" className="text-base">Sample Profiles</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-0">
                        <div className="rounded-lg bg-linear-to-r/oklch from-(--color-blue-50) to-(--color-indigo-50) dark:from-(--color-blue-900/30) dark:to-(--color-indigo-900/30) border border-(--color-blue-200) dark:border-(--color-blue-800) shadow-sm">
                            <div className="p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <InfoIcon className="h-5 w-5 text-(--color-blue-600) dark:text-(--color-blue-400) mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-semibold text-(--color-blue-800) dark:text-(--color-blue-300)">The Johari Window</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">A framework for understanding self-awareness and interpersonal dynamics in leadership</p>
                                    </div>
                                </div>

                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="item-1" className="border-b-0">
                                        <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline text-(--color-blue-700) dark:text-(--color-blue-300)">
                                            What is the Johari Window?
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm">
                                            <p className="mb-2">
                                                The Johari Window is a psychological tool created by Joseph Luft and Harry Ingham in 1955 that helps
                                                individuals better understand their relationship with themselves and others. It divides self-awareness
                                                into four quadrants based on what is known or unknown to self and others.
                                            </p>
                                            <p>
                                                For school leaders, it's a powerful framework to enhance self-awareness, improve communication,
                                                and develop more effective leadership practices through structured reflection and feedback.
                                            </p>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="item-2" className="border-b-0">
                                        <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline text-(--color-blue-700) dark:text-(--color-blue-300)">
                                            Understanding the Four Quadrants
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                                                <div className="p-4 rounded-lg bg-(--color-blue-50/50) dark:bg-(--color-blue-950/50) border border-(--color-blue-100) dark:border-(--color-blue-900)">
                                                    <h4 className="font-medium text-(--color-blue-700) dark:text-(--color-blue-300) mb-1">Open Self (Arena)</h4>
                                                    <p className="text-xs">Aspects of your leadership that both you and others see and acknowledge, including known skills, behaviors, and attitudes visible in daily practice.</p>
                                                </div>
                                                <div className="p-4 rounded-lg bg-(--color-green-50/50) dark:bg-(--color-green-950/50) border border-(--color-green-100) dark:border-(--color-green-900)">
                                                    <h4 className="font-medium text-(--color-green-700) dark:text-(--color-green-300) mb-1">Blind Self (Blind Spot)</h4>
                                                    <p className="text-xs">Leadership traits, behaviors, or impacts that others observe but you don't recognize in yourself, often revealed through feedback.</p>
                                                </div>
                                                <div className="p-4 rounded-lg bg-(--color-amber-50/50) dark:bg-(--color-amber-950/50) border border-(--color-amber-100) dark:border-(--color-amber-900)">
                                                    <h4 className="font-medium text-(--color-amber-700) dark:text-(--color-amber-300) mb-1">Hidden Self (Façade)</h4>
                                                    <p className="text-xs">Elements you know about yourself but choose not to reveal to others, including personal concerns, uncertainties, or strategic considerations.</p>
                                                </div>
                                                <div className="p-4 rounded-lg bg-(--color-purple-50/50) dark:bg-(--color-purple-950/50) border border-(--color-purple-100) dark:border-(--color-purple-900)">
                                                    <h4 className="font-medium text-(--color-purple-700) dark:text-(--color-purple-300) mb-1">Unknown Self</h4>
                                                    <p className="text-xs">Potential talents, abilities, or qualities that neither you nor others currently recognize—representing areas for future discovery and growth.</p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="item-3" className="border-b-0">
                                        <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline text-(--color-blue-700) dark:text-(--color-blue-300)">
                                            Benefits for School Leaders
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="flex items-start gap-2">
                                                    <div className="h-5 w-5 rounded-full bg-(--color-blue-100) dark:bg-(--color-blue-900) flex items-center justify-center text-xs font-medium text-(--color-blue-700) dark:text-(--color-blue-300)">1</div>
                                                    <p>Enhances emotional intelligence and self-awareness</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="h-5 w-5 rounded-full bg-(--color-blue-100) dark:bg-(--color-blue-900) flex items-center justify-center text-xs font-medium text-(--color-blue-700) dark:text-(--color-blue-300)">2</div>
                                                    <p>Improves communication with staff, students, and stakeholders</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="h-5 w-5 rounded-full bg-(--color-blue-100) dark:bg-(--color-blue-900) flex items-center justify-center text-xs font-medium text-(--color-blue-700) dark:text-(--color-blue-300)">3</div>
                                                    <p>Identifies blind spots that may impact leadership effectiveness</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="h-5 w-5 rounded-full bg-(--color-blue-100) dark:bg-(--color-blue-900) flex items-center justify-center text-xs font-medium text-(--color-blue-700) dark:text-(--color-blue-300)">4</div>
                                                    <p>Promotes trust through appropriate transparency</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="h-5 w-5 rounded-full bg-(--color-blue-100) dark:bg-(--color-blue-900) flex items-center justify-center text-xs font-medium text-(--color-blue-700) dark:text-(--color-blue-300)">5</div>
                                                    <p>Creates pathways for professional growth and development</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="h-5 w-5 rounded-full bg-(--color-blue-100) dark:bg-(--color-blue-900) flex items-center justify-center text-xs font-medium text-(--color-blue-700) dark:text-(--color-blue-300)">6</div>
                                                    <p>Strengthens team relationships through mutual understanding</p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <div className="mt-5 pt-4 border-t border-(--color-blue-200) dark:border-(--color-blue-800)">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="h-4 w-4 text-(--color-amber-500)" />
                                        <h4 className="font-medium">For best results:</h4>
                                    </div>
                                    <ul className="space-y-1 text-sm ml-6 list-disc">
                                        <li>Add multiple items in each quadrant, separated by commas</li>
                                        <li>Be specific and honest for the most valuable insights</li>
                                        <li>Consider gathering anonymous feedback from colleagues to inform your Blind Self quadrant</li>
                                        <li>Focus on professional qualities and leadership characteristics</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="samples" className="mt-0">
                        <div className="rounded-lg bg-white dark:bg-(--color-gray-900) border shadow-sm">
                            <div className="p-6">
                                <h3 className="text-lg font-medium mb-3">Select a Principal Profile</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Choose a sample profile to explore different leadership perspectives or use as a starting point for your own reflection.
                                </p>

                                <Select onValueChange={handleProfileSelect} value={selectedProfile}>
                                    <SelectTrigger className="w-full mb-4">
                                        <SelectValue placeholder="Select example principal profile" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Principal Profiles</SelectLabel>
                                            {Object.entries(PRINCIPAL_PROFILES).map(([key, profile]) => (
                                                <SelectItem key={key} value={key}>
                                                    {profile.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                {selectedProfile && (
                                    <div className="border rounded-lg p-4 mt-2 space-y-3 bg-(--color-gray-50) dark:bg-(--color-gray-900) starting:opacity-0 animate-fade-in">
                                        <h4 className="font-medium text-base">
                                            {PRINCIPAL_PROFILES[selectedProfile as keyof typeof PRINCIPAL_PROFILES].label} Profile
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            This profile has been loaded into the form below. You can edit any of the values to customize it.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Main input form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group space-y-3 starting:translate-y-4 starting:opacity-0 animate-fade-in [animation-delay:100ms]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-(--color-blue-100) dark:bg-(--color-blue-900) flex items-center justify-center text-xs font-medium text-(--color-blue-700) dark:text-(--color-blue-300)">1</div>
                            <Label htmlFor="openSelf" className="text-base font-medium">
                                Open Self (Arena)
                            </Label>
                        </div>
                        <span className="text-xs text-muted-foreground">Known to self & others</span>
                    </div>

                    {showTips && (
                        <div className="rounded-lg border bg-(--color-blue-50/50) dark:bg-(--color-blue-950/50) px-3 py-2 text-xs text-muted-foreground starting:opacity-0 animate-fade-in">
                            <h4 className="font-medium text-(--color-blue-700) dark:text-(--color-blue-300) mb-1">Professional qualities others can observe:</h4>
                            <ul className="space-y-1 ml-4 list-disc">
                                <li>Communication style and effectiveness</li>
                                <li>Technical knowledge and expertise</li>
                                <li>Decision-making approach</li>
                                <li>Leadership style and presence</li>
                                <li>Visible skills and competencies</li>
                            </ul>
                        </div>
                    )}

                    <div className="relative group">
                        <Textarea
                            id="openSelf"
                            placeholder="Add items separated by commas"
                            className="h-32 resize-none border-2 group-hover:border-(--color-blue-300) dark:group-hover:border-(--color-blue-600) focus-visible:ring-(--color-blue-200) transition-all"
                            value={johariData.openSelf}
                            onChange={(e) => handleChange('openSelf', e.target.value)}
                        />
                        <div className="absolute inset-0 -z-10 rounded-lg group-hover:shadow-md transition-all"></div>
                    </div>
                </div>

                <div className="group space-y-3 starting:translate-y-4 starting:opacity-0 animate-fade-in [animation-delay:200ms]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-(--color-green-100) dark:bg-(--color-green-900) flex items-center justify-center text-xs font-medium text-(--color-green-700) dark:text-(--color-green-300)">2</div>
                            <Label htmlFor="blindSelf" className="text-base font-medium">
                                Blind Self (Blind Spot)
                            </Label>
                        </div>
                        <span className="text-xs text-muted-foreground">Unknown to self, known to others</span>
                    </div>

                    {showTips && (
                        <div className="rounded-lg border bg-(--color-green-50/50) dark:bg-(--color-green-950/50) px-3 py-2 text-xs text-muted-foreground starting:opacity-0 animate-fade-in">
                            <h4 className="font-medium text-(--color-green-700) dark:text-(--color-green-300) mb-1">What others might observe but you don't recognize:</h4>
                            <ul className="space-y-1 ml-4 list-disc">
                                <li>Impact of your decisions on staff morale</li>
                                <li>Unintended effects of your communication style</li>
                                <li>Unconscious biases in interactions</li>
                                <li>Body language and non-verbal signals</li>
                                <li>Patterns in your leadership approach</li>
                            </ul>
                        </div>
                    )}

                    <div className="relative group">
                        <Textarea
                            id="blindSelf"
                            placeholder="Add items separated by commas"
                            className="h-32 resize-none border-2 group-hover:border-(--color-green-300) dark:group-hover:border-(--color-green-600) focus-visible:ring-(--color-green-200) transition-all"
                            value={johariData.blindSelf}
                            onChange={(e) => handleChange('blindSelf', e.target.value)}
                        />
                        <div className="absolute inset-0 -z-10 rounded-lg group-hover:shadow-md transition-all"></div>
                    </div>
                </div>

                <div className="group space-y-3 starting:translate-y-4 starting:opacity-0 animate-fade-in [animation-delay:300ms]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-(--color-amber-100) dark:bg-(--color-amber-900) flex items-center justify-center text-xs font-medium text-(--color-amber-700) dark:text-(--color-amber-300)">3</div>
                            <Label htmlFor="hiddenSelf" className="text-base font-medium">
                                Hidden Self (Façade)
                            </Label>
                        </div>
                        <span className="text-xs text-muted-foreground">Known to self, unknown to others</span>
                    </div>

                    {showTips && (
                        <div className="rounded-lg border bg-(--color-amber-50/50) dark:bg-(--color-amber-950/50) px-3 py-2 text-xs text-muted-foreground starting:opacity-0 animate-fade-in">
                            <h4 className="font-medium text-(--color-amber-700) dark:text-(--color-amber-300) mb-1">What you know but don't share with others:</h4>
                            <ul className="space-y-1 ml-4 list-disc">
                                <li>Professional uncertainties or insecurities</li>
                                <li>Strategic considerations behind decisions</li>
                                <li>Career aspirations or concerns</li>
                                <li>Personal challenges affecting work</li>
                                <li>Concerns about programs or policies</li>
                            </ul>
                        </div>
                    )}

                    <div className="relative group">
                        <Textarea
                            id="hiddenSelf"
                            placeholder="Add items separated by commas"
                            className="h-32 resize-none border-2 group-hover:border-(--color-amber-300) dark:group-hover:border-(--color-amber-600) focus-visible:ring-(--color-amber-200) transition-all"
                            value={johariData.hiddenSelf}
                            onChange={(e) => handleChange('hiddenSelf', e.target.value)}
                        />
                        <div className="absolute inset-0 -z-10 rounded-lg group-hover:shadow-md transition-all"></div>
                    </div>
                </div>

                <div className="group space-y-3 starting:translate-y-4 starting:opacity-0 animate-fade-in [animation-delay:400ms]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-(--color-purple-100) dark:bg-(--color-purple-900) flex items-center justify-center text-xs font-medium text-(--color-purple-700) dark:text-(--color-purple-300)">4</div>
                            <Label htmlFor="unknownSelf" className="text-base font-medium">
                                Unknown Self
                            </Label>
                        </div>
                        <span className="text-xs text-muted-foreground">Unknown to self & others</span>
                    </div>

                    {showTips && (
                        <div className="rounded-lg border bg-(--color-purple-50/50) dark:bg-(--color-purple-950/50) px-3 py-2 text-xs text-muted-foreground starting:opacity-0 animate-fade-in">
                            <h4 className="font-medium text-(--color-purple-700) dark:text-(--color-purple-300) mb-1">Potential areas yet to be discovered:</h4>
                            <ul className="space-y-1 ml-4 list-disc">
                                <li>Untapped leadership abilities and talents</li>
                                <li>Future growth and development areas</li>
                                <li>Latent skills that could emerge under new circumstances</li>
                                <li>Unexpected strengths in crisis situations</li>
                                <li>Innovative approaches not yet considered</li>
                            </ul>
                        </div>
                    )}

                    <div className="relative group">
                        <Textarea
                            id="unknownSelf"
                            placeholder="Add items separated by commas"
                            className="h-32 resize-none border-2 group-hover:border-(--color-purple-300) dark:group-hover:border-(--color-purple-600) focus-visible:ring-(--color-purple-200) transition-all"
                            value={johariData.unknownSelf}
                            onChange={(e) => handleChange('unknownSelf', e.target.value)}
                        />
                        <div className="absolute inset-0 -z-10 rounded-lg group-hover:shadow-md transition-all"></div>
                    </div>
                </div>
            </div>

            {/* Show tips toggle button */}
            <div className="flex justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTips(!showTips)}
                    className="text-sm"
                >
                    {showTips ? 'Hide Tips' : 'Show Writing Tips'}
                </Button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 starting:translate-y-4 starting:opacity-0 animate-fade-in [animation-delay:500ms]">
                <Button
                    onClick={handleViewIn3D}
                    disabled={!allFieldsHaveContent}
                    size="lg"
                    className="w-full sm:w-auto bg-linear-to-r/oklch from-(--color-blue-600) to-(--color-indigo-600) border-0 hover:from-(--color-blue-700) hover:to-(--color-indigo-700) shadow-sm transform-3d perspective-distant hover:translate-z-2"
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
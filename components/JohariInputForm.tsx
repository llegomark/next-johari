'use client'

import { useJohari } from './JohariProvider'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { InfoIcon, HelpCircle } from 'lucide-react'
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

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

// Tips for each quadrant
const QUADRANT_TIPS = {
    openSelf: {
        title: "Open Self (Arena)",
        description: "Known to self & others",
        tips: [
            "Communication style and effectiveness",
            "Technical knowledge and expertise",
            "Decision-making approach",
            "Leadership style and presence",
            "Visible skills and competencies"
        ]
    },
    blindSelf: {
        title: "Blind Self (Blind Spot)",
        description: "Unknown to self, known to others",
        tips: [
            "Impact of your decisions on staff morale",
            "Unintended effects of your communication style",
            "Unconscious biases in interactions",
            "Body language and non-verbal signals",
            "Patterns in your leadership approach"
        ]
    },
    hiddenSelf: {
        title: "Hidden Self (Façade)",
        description: "Known to self, unknown to others",
        tips: [
            "Professional uncertainties or insecurities",
            "Strategic considerations behind decisions",
            "Career aspirations or concerns",
            "Personal challenges affecting work",
            "Concerns about programs or policies"
        ]
    },
    unknownSelf: {
        title: "Unknown Self",
        description: "Unknown to self & others",
        tips: [
            "Untapped leadership abilities and talents",
            "Future growth and development areas",
            "Latent skills that could emerge under new circumstances",
            "Unexpected strengths in crisis situations",
            "Innovative approaches not yet considered"
        ]
    }
}

export function JohariInputForm() {
    const { johariData, updateJohariData } = useJohari()
    const [selectedProfile, setSelectedProfile] = useState<string>("")

    const handleChange = (field: keyof typeof johariData, value: string) => {
        updateJohariData(field, value)
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
        <div className="space-y-6">
            {/* Simple header */}
            <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">Johari Window Assessment</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    A tool for self-awareness and leadership development
                </p>
            </div>

            {/* Profile selector */}
            <div className="bg-(--color-gray-50) dark:bg-(--color-gray-900) p-4 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-medium">Template Profiles</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Optional: Choose a starting point for your self-assessment
                        </p>
                    </div>
                    <Select onValueChange={handleProfileSelect} value={selectedProfile}>
                        <SelectTrigger className="w-full sm:w-64">
                            <SelectValue placeholder="Select a principal profile" />
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
                </div>
            </div>

            {/* Quadrants grid with tooltips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Generate all four quadrants */}
                {Object.entries(QUADRANT_TIPS).map(([field, info], index) => {
                    // Set colors based on quadrant
                    const colors = [
                        { bg: "blue", num: "1" },
                        { bg: "green", num: "2" },
                        { bg: "amber", num: "3" },
                        { bg: "purple", num: "4" }
                    ][index];

                    return (
                        <div key={field} className="space-y-2 starting:translate-y-2 starting:opacity-0 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`h-5 w-5 rounded-full bg-(--color-${colors.bg}-100) dark:bg-(--color-${colors.bg}-900) flex items-center justify-center text-xs font-medium text-(--color-${colors.bg}-700) dark:text-(--color-${colors.bg}-300)`}>
                                        {colors.num}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Label htmlFor={field} className="text-base font-medium">
                                            {info.title}
                                        </Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className={`h-4 w-4 text-(--color-${colors.bg}-500) cursor-help`} />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-xs">
                                                    <div className="space-y-2">
                                                        <p className="font-medium">Tips for this quadrant:</p>
                                                        <ul className="list-disc pl-5 text-xs space-y-1">
                                                            {info.tips.map((tip, i) => (
                                                                <li key={i}>{tip}</li>
                                                            ))}
                                                        </ul>
                                                        <p className="text-xs italic pt-1">Add items separated by commas</p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{info.description}</span>
                            </div>

                            <div className="relative">
                                <Textarea
                                    id={field}
                                    placeholder="Add items separated by commas"
                                    className={`h-32 resize-none focus-visible:ring-(--color-${colors.bg}-200) hover:border-(--color-${colors.bg}-300) dark:hover:border-(--color-${colors.bg}-600) transition-all`}
                                    value={johariData[field as keyof typeof johariData]}
                                    onChange={(e) => handleChange(field as keyof typeof johariData, e.target.value)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Subtle help information */}
            <div className="text-xs text-muted-foreground mt-6 flex items-start gap-2">
                <InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                    The Johari Window helps you reflect on your leadership style by examining what is known or unknown to yourself and others.
                    Add multiple items in each quadrant, separated by commas. For best results, be specific and honest in your reflections.
                </p>
            </div>
        </div>
    )
}
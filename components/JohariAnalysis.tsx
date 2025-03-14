'use client'

import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { useJohari } from './JohariProvider'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { useState, useEffect, ReactNode } from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { Copy, Check } from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Line,
    ScatterChart,
    Scatter,
    ZAxis
} from 'recharts'

// Define TypeScript interfaces for our chart data
interface QuadrantData {
    name: string;
    value: number;
}

interface StrengthWeakness {
    category: string;
    strength: number;
    growth: number;
}

interface LeadershipRadarItem {
    attribute: string;
    value: number;
}

// New interfaces for additional charts
interface TimelineItem {
    phase: string;
    description: string;
    start: number; // weeks from start
    duration: number; // in weeks
}

interface QuadrantProjection {
    quadrant: string;
    current: number;
    projected: number;
}

interface FeedbackStakeholder {
    id: string;
    name: string;
    group: string; // e.g., "Internal", "External"
    x: number; // position for scatter chart
    y: number; // position for scatter chart
    size: number; // importance/influence size
}

interface FeedbackConnection {
    source: string;
    target: string;
    strength: number; // connection strength (1-10)
}

interface FeedbackNetwork {
    stakeholders: FeedbackStakeholder[];
    connections: FeedbackConnection[];
}

// Updated ChartData interface with new chart types and explanations
interface ChartExplanation {
    title: string;
    content: string;
}

interface ChartData {
    quadrantData?: QuadrantData[];
    strengthsWeaknesses?: StrengthWeakness[];
    leadershipRadar?: LeadershipRadarItem[];
    timelineData?: TimelineItem[];
    quadrantProjection?: QuadrantProjection[];
    feedbackNetwork?: FeedbackNetwork;
    chartExplanations?: {
        quadrantData?: ChartExplanation;
        strengthsWeaknesses?: ChartExplanation;
        leadershipRadar?: ChartExplanation;
        timelineData?: ChartExplanation;
        quadrantProjection?: ChartExplanation;
        feedbackNetwork?: ChartExplanation;
    };
}

export function JohariAnalysis() {
    const { johariData, analysis, setAnalysis } = useJohari()
    const [chartData, setChartData] = useState<ChartData | null>(null)
    const [isCopied, setIsCopied] = useState<boolean>(false)

    // Use the useChat hook to handle streaming
    const { messages, append, isLoading, error, setMessages } = useChat({
        api: '/api/analysis',
        onFinish: (message) => {
            // Save the final message to the Johari provider for persistence
            setAnalysis(message.content)

            // Try to extract and parse chart data from the message
            extractChartData(message.content)
        },
    })

    // Get the latest assistant message for display
    const currentAnalysis = messages
        .filter(message => message.role === 'assistant')
        .pop()?.content || analysis

    // Copy analysis to clipboard
    const handleCopyToClipboard = async (): Promise<void> => {
        if (!currentAnalysis) return;

        try {
            // Remove the chart data before copying
            const contentWithoutChart = currentAnalysis.replace(/```chart[\s\S]*?```/g, '')
            await navigator.clipboard.writeText(contentWithoutChart);
            setIsCopied(true);

            // Reset copy status after 2 seconds
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    // Extract chart data from the markdown content
    const extractChartData = (content: string): void => {
        try {
            // Look for JSON chart data between specific markers
            const chartDataRegex = /```chart\n([\s\S]*?)\n```/g
            const matches = content.matchAll(chartDataRegex)

            for (const match of Array.from(matches)) {
                if (match[1]) {
                    try {
                        const parsedData = JSON.parse(match[1]) as ChartData
                        setChartData(parsedData)
                        console.log('Found chart data:', parsedData)
                        return
                    } catch (e) {
                        console.error('Failed to parse chart data:', e)
                    }
                }
            }

            // If we get here, no chart data was found
            console.log('No chart data found in response')
        } catch (error) {
            console.error('Error extracting chart data:', error)
        }
    }

    // When component mounts, try to extract chart data from existing analysis
    useEffect(() => {
        if (analysis) {
            extractChartData(analysis)
        }
    }, [analysis])

    // Generate and stream the analysis
    const generateAnalysis = (): void => {
        if (
            !johariData.openSelf ||
            !johariData.blindSelf ||
            !johariData.hiddenSelf ||
            !johariData.unknownSelf
        ) {
            alert('Please fill in all quadrants of the Johari Window before generating an analysis.')
            return
        }

        // Clear existing messages and chart data
        setMessages([])
        setChartData(null)

        // Create the prompt with updates for new visualizations and chart explanations
        const prompt = `
You are providing a confidential leadership assessment based on Johari Window data for a school principal in the Philippines. 

IMPORTANT: Do not wrap your entire response in markdown triple backticks or any other markdown wrapper. The content itself should use markdown formatting for headings, lists, etc., but do not add any fences around the entire response.

Output the complete analysis directly with no introductory text or statements like "Here's an analysis..." or "Based on the data provided..."

Analyze the following Johari Window data through the lens of educational leadership:

OPEN SELF (Arena):
${johariData.openSelf}

BLIND SELF (Blind Spot):
${johariData.blindSelf}

HIDDEN SELF (Façade):
${johariData.hiddenSelf}

UNKNOWN SELF (Unknown Area):
${johariData.unknownSelf}

Your analysis should include:

# Leadership Profile Assessment
A concise assessment of the leadership style, strengths, and development areas based on patterns across all four quadrants.

# Key Insights
- How the balance between quadrants affects leadership effectiveness
- Critical blind spots that may impact school management and relationships
- Hidden strengths that should be leveraged more visibly
- Potential areas for exploration in the unknown quadrant

# Development Recommendations
1. Three specific, actionable steps to expand the Open quadrant
2. Two strategies to receive feedback about Blind spots
3. One approach to appropriately share relevant Hidden attributes
4. Professional development priorities aligned with Filipino educational context

# Implementation Timeline
A realistic timeframe for implementing these recommendations within the Philippine educational system, organized in phases.

# Key Stakeholders for Feedback
Identify 5-7 key stakeholders (both internal and external) who should be engaged to provide feedback about blind spots.

Format your response using markdown for internal content organization with appropriate headings, bullet points, and numbered lists, but do not wrap the entire response in markdown code blocks or other delimiters.

Include visualization data as JSON in this exact format:
\`\`\`chart
{
  "quadrantData": [
    { "name": "Open Self", "value": [numeric value] },
    { "name": "Blind Self", "value": [numeric value] },
    { "name": "Hidden Self", "value": [numeric value] },
    { "name": "Unknown Self", "value": [numeric value] }
  ],
  "strengthsWeaknesses": [
    { "category": "[leadership trait]", "strength": [0-10], "growth": [0-10] },
    { "category": "[leadership trait]", "strength": [0-10], "growth": [0-10] },
    { "category": "[leadership trait]", "strength": [0-10], "growth": [0-10] },
    { "category": "[leadership trait]", "strength": [0-10], "growth": [0-10] },
    { "category": "[leadership trait]", "strength": [0-10], "growth": [0-10] }
  ],
  "leadershipRadar": [
    { "attribute": "Strategic Thinking", "value": [0-10] },
    { "attribute": "Team Building", "value": [0-10] },
    { "attribute": "Communication", "value": [0-10] },
    { "attribute": "Resource Management", "value": [0-10] },
    { "attribute": "Instructional Leadership", "value": [0-10] },
    { "attribute": "Community Engagement", "value": [0-10] }
  ],
  "timelineData": [
    { "phase": "Phase 1", "description": "[short description]", "start": [week number], "duration": [number of weeks] },
    { "phase": "Phase 2", "description": "[short description]", "start": [week number], "duration": [number of weeks] },
    { "phase": "Phase 3", "description": "[short description]", "start": [week number], "duration": [number of weeks] },
    { "phase": "Phase 4", "description": "[short description]", "start": [week number], "duration": [number of weeks] }
  ],
  "quadrantProjection": [
    { "quadrant": "Open Self", "current": [current value], "projected": [projected value] },
    { "quadrant": "Blind Self", "current": [current value], "projected": [projected value] },
    { "quadrant": "Hidden Self", "current": [current value], "projected": [projected value] },
    { "quadrant": "Unknown Self", "current": [current value], "projected": [projected value] }
  ],
  "feedbackNetwork": {
    "stakeholders": [
      { "id": "principal", "name": "Principal", "group": "Self", "x": 50, "y": 50, "size": 10 },
      { "id": "[stakeholder1]", "name": "[Stakeholder Name]", "group": "[Internal/External]", "x": [0-100], "y": [0-100], "size": [1-10] },
      { "id": "[stakeholder2]", "name": "[Stakeholder Name]", "group": "[Internal/External]", "x": [0-100], "y": [0-100], "size": [1-10] },
      { "id": "[stakeholder3]", "name": "[Stakeholder Name]", "group": "[Internal/External]", "x": [0-100], "y": [0-100], "size": [1-10] },
      { "id": "[stakeholder4]", "name": "[Stakeholder Name]", "group": "[Internal/External]", "x": [0-100], "y": [0-100], "size": [1-10] },
      { "id": "[stakeholder5]", "name": "[Stakeholder Name]", "group": "[Internal/External]", "x": [0-100], "y": [0-100], "size": [1-10] }
    ],
    "connections": [
      { "source": "principal", "target": "[stakeholder1]", "strength": [1-10] },
      { "source": "principal", "target": "[stakeholder2]", "strength": [1-10] },
      { "source": "principal", "target": "[stakeholder3]", "strength": [1-10] },
      { "source": "principal", "target": "[stakeholder4]", "strength": [1-10] },
      { "source": "principal", "target": "[stakeholder5]", "strength": [1-10] }
    ]
  },
  "chartExplanations": {
    "quadrantData": {
      "title": "Understanding Your Johari Window Balance",
      "content": "[Write a detailed explanation about what the quadrant balance shows, what the percentages mean, and specific insights about the principal's current distribution of self-awareness quadrants. Include 2-3 key takeaways.]"
    },
    "strengthsWeaknesses": {
      "title": "Analyzing Your Strengths and Growth Areas",
      "content": "[Provide an interpretation of the strengths vs. growth areas chart, explaining patterns, notable strengths, priority development areas, and how they connect to the Johari Window insights. Include 2-3 specific recommendations based on this data.]"
    },
    "leadershipRadar": {
      "title": "Leadership Competency Profile",
      "content": "[Explain the leadership radar chart, noting highest and lowest scoring areas, balance/imbalance patterns, and how these competencies connect to the principal's Johari Window data. Include 2-3 actionable insights for competency development.]"
    },
    "timelineData": {
      "title": "Implementation Roadmap Breakdown",
      "content": "[Provide a detailed explanation of the implementation timeline, including rationale for sequencing, critical path considerations, potential challenges during each phase, and adaptation strategies for the Philippine educational context.]"
    },
    "quadrantProjection": {
      "title": "Your Growth Trajectory",
      "content": "[Explain what the projected changes mean, which areas will see the most significant development, what improvements would look like in practice, and how this connects to career advancement in Philippine educational leadership.]"
    },
    "feedbackNetwork": {
      "title": "Strategic Feedback Relationships",
      "content": "[Explain the feedback network diagram, clarifying what the stakeholder positions, sizes and connections represent, which relationships are most critical for development, and specific strategies for engaging each stakeholder type for better feedback in the context of Philippine school leadership.]"
    }
  }
}
\`\`\`

Calculate the values based on your analysis of the Johari Window data. The "quadrantData" should reflect the relative development of each quadrant, with higher values indicating more developed areas. For "strengthsWeaknesses" and "leadershipRadar," use a scale of 0-10 where higher numbers indicate greater strength. For the "quadrantProjection," estimate how the quadrant values might change after implementing your recommendations. For the "feedbackNetwork," position stakeholders based on their relationship to the principal (closer = stronger relationship) and size based on their importance for feedback.

Create thoughtful, detailed explanations for each chart in the "chartExplanations" section that will help the school head understand the visualizations. These explanations should be educational in nature, context-specific to the Philippine educational system, and provide practical interpretations of the data. Each explanation should be 3-5 sentences in length.

FINAL REMINDER: Do not include any explanatory text about the charts or data structure in the main analysis, and do not wrap your response in markdown code blocks (such as \`\`\`markdown or \`\`\`). All chart explanations should be contained within the chartExplanations object.
`

        // Send the prompt - this will automatically start streaming the response
        append({
            role: 'user',
            content: prompt,
        })
    }

    // Clean and render the markdown by removing the chart data and sanitizing
    const renderMarkdown = (text: string): { __html: string } => {
        try {
            // Remove the chart data from the content before displaying
            const contentWithoutChart = text.replace(/```chart[\s\S]*?```/g, '')

            // Also remove any erroneous triple backtick markdown wrappers at the beginning and end
            const cleanedContent = contentWithoutChart
                .replace(/^```markdown\s*\n/g, '')
                .replace(/^```\s*\n/g, '')
                .replace(/\n```\s*$/g, '')

            // Use marked as a function with a type assertion to avoid TypeScript issues
            const htmlString = marked(cleanedContent) as string

            // Sanitize the HTML with DOMPurify
            const sanitizedHtml = DOMPurify.sanitize(htmlString, {
                USE_PROFILES: { html: true },
                FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
                FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
                ADD_ATTR: ['target'],
                ALLOW_DATA_ATTR: false
            })

            return { __html: sanitizedHtml }
        } catch (error) {
            console.error('Error parsing or sanitizing markdown:', error)
            return { __html: text }
        }
    }

    // Render charts based on the chart data
    const renderCharts = (): ReactNode => {
        if (!chartData) return null

        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']
        const GROUPS = {
            'Self': '#FF8042',
            'Internal': '#0088FE',
            'External': '#00C49F'
        }

        return (
            <div className="space-y-8 mt-6">
                <h2 className="text-xl font-semibold">Leadership Profile Visualization</h2>

                {/* Johari Window Quadrants - Pie Chart */}
                {chartData.quadrantData && (
                    <Card className="p-4">
                        <CardTitle className="text-lg mb-4">Johari Window Balance</CardTitle>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData.quadrantData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {chartData.quadrantData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {chartData.chartExplanations?.quadrantData && (
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-medium text-base">{chartData.chartExplanations.quadrantData.title}</h4>
                                <p className="mt-2 text-sm text-muted-foreground">{chartData.chartExplanations.quadrantData.content}</p>
                            </div>
                        )}
                    </Card>
                )}

                {/* Quadrant Improvement Projection - Grouped Bar Chart */}
                {chartData.quadrantProjection && (
                    <Card className="p-4">
                        <CardTitle className="text-lg mb-4">Quadrant Improvement Projection</CardTitle>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData.quadrantProjection}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="quadrant" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="current" name="Current" fill="#8884d8" />
                                    <Bar dataKey="projected" name="Projected" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {chartData.chartExplanations?.quadrantProjection && (
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-medium text-base">{chartData.chartExplanations.quadrantProjection.title}</h4>
                                <p className="mt-2 text-sm text-muted-foreground">{chartData.chartExplanations.quadrantProjection.content}</p>
                            </div>
                        )}
                    </Card>
                )}

                {/* Strengths vs Growth Areas - Bar Chart */}
                {chartData.strengthsWeaknesses && (
                    <Card className="p-4">
                        <CardTitle className="text-lg mb-4">Strengths vs. Growth Areas</CardTitle>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData.strengthsWeaknesses}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis domain={[0, 10]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="strength" name="Strengths" fill="#0088FE" />
                                    <Bar dataKey="growth" name="Growth Areas" fill="#FF8042" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {chartData.chartExplanations?.strengthsWeaknesses && (
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-medium text-base">{chartData.chartExplanations.strengthsWeaknesses.title}</h4>
                                <p className="mt-2 text-sm text-muted-foreground">{chartData.chartExplanations.strengthsWeaknesses.content}</p>
                            </div>
                        )}
                    </Card>
                )}

                {/* Leadership Skills - Radar Chart */}
                {chartData.leadershipRadar && (
                    <Card className="p-4">
                        <CardTitle className="text-lg mb-4">Leadership Competencies</CardTitle>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.leadershipRadar}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="attribute" />
                                    <PolarRadiusAxis domain={[0, 10]} />
                                    <Radar name="Leadership Skills" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        {chartData.chartExplanations?.leadershipRadar && (
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-medium text-base">{chartData.chartExplanations.leadershipRadar.title}</h4>
                                <p className="mt-2 text-sm text-muted-foreground">{chartData.chartExplanations.leadershipRadar.content}</p>
                            </div>
                        )}
                    </Card>
                )}

                {/* Implementation Timeline - Gantt-style Chart */}
                {chartData.timelineData && (
                    <Card className="p-4">
                        <CardTitle className="text-lg mb-4">Implementation Timeline</CardTitle>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={chartData.timelineData}
                                    margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 'dataMax']} label={{ value: 'Weeks', position: 'insideBottom', offset: -5 }} />
                                    <YAxis
                                        type="category"
                                        dataKey="phase"
                                        width={100}
                                        tickFormatter={(value) => {
                                            return value.length > 15 ? value.substring(0, 15) + '...' : value;
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (name === 'start') return [`Start: Week ${value}`, name];
                                            if (name === 'duration') return [`Duration: ${value} weeks`, name];
                                            return [value, name];
                                        }}
                                        labelFormatter={(label) => {
                                            const item = chartData.timelineData?.find(item => item.phase === label);
                                            return `${label}: ${item?.description || ''}`;
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="duration" name="Duration" stackId="a" fill="#8884d8">
                                        {chartData.timelineData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {chartData.chartExplanations?.timelineData && (
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-medium text-base">{chartData.chartExplanations.timelineData.title}</h4>
                                <p className="mt-2 text-sm text-muted-foreground">{chartData.chartExplanations.timelineData.content}</p>
                            </div>
                        )}
                    </Card>
                )}

                {/* Feedback Network Diagram - Scatter Chart */}
                {chartData.feedbackNetwork && (
                    <Card className="p-4">
                        <CardTitle className="text-lg mb-4">Feedback Network Diagram</CardTitle>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart
                                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                >
                                    <CartesianGrid />
                                    <XAxis type="number" dataKey="x" name="Distance" domain={[0, 100]} hide />
                                    <YAxis type="number" dataKey="y" name="Distance" domain={[0, 100]} hide />
                                    <ZAxis type="number" dataKey="size" range={[40, 160]} />
                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (name === 'x' || name === 'y') return null;
                                            if (name === 'size') return [`Influence: ${value}/10`, 'Influence'];
                                            return [value, name];
                                        }}
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                const connections = chartData.feedbackNetwork?.connections.filter(
                                                    c => c.source === data.id || c.target === data.id
                                                );

                                                return (
                                                    <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
                                                        <p className="font-bold">{data.name}</p>
                                                        <p>Group: {data.group}</p>
                                                        <p>Influence: {data.size}/10</p>
                                                        {connections && connections.map((conn, i) => {
                                                            const targetId = conn.target === data.id ? conn.source : conn.target;
                                                            const targetStakeholder = chartData.feedbackNetwork?.stakeholders.find(s => s.id === targetId);
                                                            return (
                                                                <p key={i} className="text-xs">
                                                                    Connection to {targetStakeholder?.name}: {conn.strength}/10
                                                                </p>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend />
                                    {/* Draw connection lines */}
                                    {chartData.feedbackNetwork.connections.map((connection, index) => {
                                        const source = chartData.feedbackNetwork?.stakeholders.find(s => s.id === connection.source);
                                        const target = chartData.feedbackNetwork?.stakeholders.find(s => s.id === connection.target);

                                        if (!source || !target) return null;

                                        const lineData = [
                                            { x: source.x, y: source.y },
                                            { x: target.x, y: target.y }
                                        ];

                                        return (
                                            <Line
                                                key={`connection-${index}`}
                                                data={lineData}
                                                type="linear"
                                                dataKey="x"
                                                stroke="#D3D3D3"
                                                strokeWidth={connection.strength / 2}
                                                dot={false}
                                                activeDot={false}
                                                isAnimationActive={false}
                                            />
                                        );
                                    })}

                                    {/* Group stakeholders by their group for the legend */}
                                    {Array.from(new Set(chartData.feedbackNetwork.stakeholders.map(s => s.group))).map((group) => {
                                        const groupStakeholders = chartData.feedbackNetwork?.stakeholders.filter(s => s.group === group) || [];
                                        const groupColor = GROUPS[group as keyof typeof GROUPS] || '#8884d8';
                                        return (
                                            <Scatter
                                                key={`group-${group}`}
                                                name={group}
                                                data={groupStakeholders}
                                                fill={groupColor}
                                            />
                                        );
                                    })}
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                        {chartData.chartExplanations?.feedbackNetwork && (
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-medium text-base">{chartData.chartExplanations.feedbackNetwork.title}</h4>
                                <p className="mt-2 text-sm text-muted-foreground">{chartData.chartExplanations.feedbackNetwork.content}</p>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        )
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
                            Generate a personalized analysis based on your Johari Window data with visualizations
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

            <Card className="flex-1 overflow-auto">
                <CardContent className="pt-3 px-6 pb-6">
                    <div className="flex justify-end mb-4">
                        {!isLoading && currentAnalysis && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex gap-2 items-center"
                                onClick={handleCopyToClipboard}
                                disabled={isCopied}
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    <div className="prose prose-lg prose-headings:font-bold prose-headings:text-black dark:prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-3 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-li:ml-4 max-w-none">
                        <article
                            className="markdown-content mt-0"
                            dangerouslySetInnerHTML={renderMarkdown(currentAnalysis)}
                        />
                    </div>

                    {/* Render the charts with explanations below the text analysis */}
                    {renderCharts()}

                    {/* Only show the Generate New Analysis button when not loading */}
                    {!isLoading && (
                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={() => {
                                    setMessages([])
                                    setAnalysis('')
                                    setChartData(null)
                                }}
                                variant="outline"
                            >
                                Generate New Analysis
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
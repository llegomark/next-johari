'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JohariInputForm } from './JohariInputForm'
import { JohariVisualization } from './JohariVisualization'
import { JohariAnalysis } from './JohariAnalysis'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useJohari } from './JohariProvider'

export function JohariTabs() {
    const [activeTab, setActiveTab] = useState('input')
    const { johariData } = useJohari()

    // Force resize event after tab change to ensure proper 3D rendering
    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
        }, 100)

        return () => clearTimeout(timer)
    }, [activeTab])

    // Check if there's data to show
    const hasData = Object.values(johariData).some(value => value.trim() !== '')

    // Handle tab change to enforce data requirements
    const handleTabChange = (value: string) => {
        // Only allow switching to visualization or analysis if there's data
        if ((value === 'visualization' || value === 'analysis') && !hasData) {
            return
        }
        setActiveTab(value)
    }

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
        >
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="input">Input Data</TabsTrigger>
                <TabsTrigger value="visualization" disabled={!hasData}>3D View</TabsTrigger>
                <TabsTrigger value="analysis" disabled={!hasData}>AI Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="mt-6">
                <Card className="p-4 md:p-6">
                    <JohariInputForm
                        onDataEntered={() => setActiveTab('visualization')}
                    />
                </Card>
            </TabsContent>

            <TabsContent value="visualization" className="mt-6">
                <Card className="p-4 md:p-6">
                    <div className="min-h-[500px] md:min-h-[600px] h-full">
                        <JohariVisualization />
                    </div>
                </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-6">
                <Card className="p-4 md:p-6">
                    <div className="min-h-[500px] md:min-h-[600px] h-full">
                        <JohariAnalysis />
                    </div>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JohariInputForm } from './JohariInputForm'
import { JohariVisualization } from './JohariVisualization'
import { JohariAnalysis } from './JohariAnalysis'
import { Card } from '@/components/ui/card'

export function JohariTabs() {
    return (
        <Tabs defaultValue="input" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">Input Johari Data</TabsTrigger>
                <TabsTrigger value="visualization">3D Visualization & Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="input">
                <Card className="p-6">
                    <JohariInputForm />
                </Card>
            </TabsContent>

            <TabsContent value="visualization">
                <Card className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="min-h-[400px] h-full">
                            <JohariVisualization />
                        </div>
                        <div>
                            <JohariAnalysis />
                        </div>
                    </div>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
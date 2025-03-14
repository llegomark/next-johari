'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type JohariData = {
    openSelf: string
    blindSelf: string
    hiddenSelf: string
    unknownSelf: string
}

interface JohariContextType {
    johariData: JohariData
    updateJohariData: (field: keyof JohariData, value: string) => void
    analysis: string
    setAnalysis: (analysis: string) => void
}

const initialJohariData: JohariData = {
    openSelf: '',
    blindSelf: '',
    hiddenSelf: '',
    unknownSelf: ''
}

const JohariContext = createContext<JohariContextType | undefined>(undefined)

export function JohariProvider({ children }: { children: ReactNode }) {
    const [johariData, setJohariData] = useState<JohariData>(initialJohariData)
    const [analysis, setAnalysis] = useState<string>('')

    const updateJohariData = (field: keyof JohariData, value: string) => {
        setJohariData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <JohariContext.Provider value={{ johariData, updateJohariData, analysis, setAnalysis }}>
            {children}
        </JohariContext.Provider>
    )
}

export function useJohari() {
    const context = useContext(JohariContext)
    if (!context) {
        throw new Error('useJohari must be used within a JohariProvider')
    }
    return context
}
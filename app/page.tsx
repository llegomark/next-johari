'use client'

import { JohariTabs } from '@/components/JohariTabs'
import { JohariProvider } from '@/components/JohariProvider'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Johari Window for School Leaders</h1>
        <p className="text-lg mb-8 text-zinc-600 dark:text-zinc-400">
          A self-reflection and feedback tool for school heads and principals in the Philippines
        </p>

        <JohariProvider>
          <JohariTabs />
        </JohariProvider>
      </div>
    </main>
  )
}
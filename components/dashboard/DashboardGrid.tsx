"use client"

import { ReactNode } from "react"

interface DashboardGridProps {
  children: ReactNode
}

export default function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
      {children}
    </div>
  )
}

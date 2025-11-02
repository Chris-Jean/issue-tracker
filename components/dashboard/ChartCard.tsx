"use client"

import { ReactNode } from "react"

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
}

export default function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

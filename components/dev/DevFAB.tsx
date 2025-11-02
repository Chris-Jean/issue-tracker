"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import DevSettingsModal from "./DevSettingsModal"

export default function DevFAB() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
        aria-label="Open Dev Settings"
        title="Dev Settings"
      >
        <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />

        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></span>
      </button>

      {/* Settings Modal */}
      <DevSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

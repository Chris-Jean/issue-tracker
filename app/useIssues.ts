import { useState } from "react"
import type { Issue } from "./types"

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([])

  const addIssue = (issue: Omit<Issue, "id">) => {
    const newIssue = { ...issue, id: Date.now().toString() }
    setIssues((prevIssues) => [...prevIssues, newIssue])
  }

  const updateIssue = (updatedIssue: Issue) => {
    setIssues((prevIssues) => prevIssues.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)))
  }

  const deleteIssue = (id: string) => {
    setIssues((prevIssues) => prevIssues.filter((issue) => issue.id !== id))
  }

  return { issues, addIssue, updateIssue, deleteIssue }
}


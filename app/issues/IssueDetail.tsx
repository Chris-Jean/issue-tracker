"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import type { MetaIssue } from "./types";

interface IssueDetailProps {
  issue: MetaIssue;
  onClose: () => void;
  onUpdate: (updatedIssue: MetaIssue) => void; // ✅ full issue type restored
}

export default function IssueDetail({ issue, onClose, onUpdate }: IssueDetailProps) {
  const [editedIssue, setEditedIssue] = useState<MetaIssue>(issue); // ✅ use full type

  useEffect(() => {
    setEditedIssue(issue);
  }, [issue]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedIssue((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (window.confirm("Are you sure you want to save changes to this issue?")) {
      onUpdate(editedIssue); // ✅ full issue object passed
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Edit Issue</h2>
      <Input
        type="text"
        name="title"
        value={editedIssue.title ?? ""}
        onChange={handleChange}
        placeholder="Caller ID"
      />
      <Input
        type="text"
        name="agent"
        value={editedIssue.agent ?? ""}
        onChange={handleChange}
        placeholder="Service #"
      />
      <Input
        type="text"
        name="userType"
        value={editedIssue.userType ?? ""}
        onChange={handleChange}
        placeholder="Client"
      />
      <Input
        type="text"
        name="internetSource"
        value={editedIssue.internetSource ?? ""}
        onChange={handleChange}
        placeholder="Project Name"
      />
      <Input
        type="text"
        name="language"
        value={editedIssue.language ?? ""}
        onChange={handleChange}
        placeholder="Language"
      />
      <Input
        type="text"
        name="reason"
        value={editedIssue.reason ?? ""}
        onChange={handleChange}
        placeholder="Reason"
      />
      <Textarea
        name="description"
        value={editedIssue.description ?? ""}
        onChange={handleChange}
        placeholder="Description"
      />
      <Input
        type="datetime-local"
        name="dateOfIncident"
        value={editedIssue.dateOfIncident?.split(".")[0] ?? ""}
        onChange={handleChange}
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}

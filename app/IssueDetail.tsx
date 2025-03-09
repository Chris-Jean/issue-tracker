import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { MetaIssue } from "./types";

interface IssueDetailProps {
  issue: MetaIssue;
  onClose: () => void;
  onUpdate: (updatedIssue: MetaIssue) => void;
}

export default function IssueDetail({
  issue,
  onClose,
  onUpdate,
}: IssueDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedIssue, setEditedIssue] = useState(issue);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedIssue((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (window.confirm("Are you sure you want to save these changes?")) {
      onUpdate(editedIssue);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`bg-white p-4 rounded shadow ${isEditing ? "border-2 border-blue-500" : ""}`}
    >
      <h3 className="text-xl font-semibold mb-2">
        {isEditing ? (
          <Input
            type="text"
            name="title"
            value={editedIssue.title}
            onChange={handleChange}
          />
        ) : (
          editedIssue.title
        )}
      </h3>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            name="description"
            value={editedIssue.description}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="agent"
            value={editedIssue.agent}
            onChange={handleChange}
            placeholder="Agent"
          />
          <Input
            type="text"
            name="language"
            value={editedIssue.language}
            onChange={handleChange}
            placeholder="Language"
          />
          <Input
            type="text"
            name="VPN"
            value={editedIssue.VPN}
            onChange={handleChange}
            placeholder="VPN"
          />
          <Input
            type="text"
            name="internetSource"
            value={editedIssue.internetSource}
            onChange={handleChange}
            placeholder="Internet Source"
          />
        </div>
      ) : (
        <div>
          <p className="mb-2">{editedIssue.description}</p>
          <p className="text-sm text-gray-600">Agent: {editedIssue.agent}</p>
          <p className="text-sm text-gray-600">
            Language: {editedIssue.language}
          </p>
          <p className="text-sm text-gray-600">VPN: {editedIssue.VPN}</p>
          <p className="text-sm text-gray-600">
            Internet Source: {editedIssue.internetSource}
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import type { ConvexIssue, Issue } from "./types";

interface IssueFormProps {
  onSubmit: (issue: Issue, previewUrl: File | null) => void;
  initialIssue?: Issue;
  onCancel: () => void;
}
const getFormattedLocalDate = () => {
  const now = new Date();
  return now.toLocaleDateString("en-CS");
};

const emptyIssue: ConvexIssue = {
  title: "",
  agent: "",
  language: "",
  description: "",
  userType: "",
  VPN: "",
  internetSource: "",
  category: "",
  dateOfIncident: getFormattedLocalDate(),
};

export default function IssueForm({
  onSubmit,
  initialIssue,
  onCancel,
}: IssueFormProps) {
  const [issue, setIssue] = useState<Issue>(emptyIssue);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Convex mutations

  useEffect(() => {
    if (initialIssue) {
      setIssue(initialIssue);
    } else {
      setIssue(emptyIssue);
    }
  }, [initialIssue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(issue as Issue, selectedImage ? selectedImage : null);
    setIssue(emptyIssue);
    setSelectedImage(null);  // ✅ Clears image preview
    setPreviewUrl(null);     // ✅ Clears image preview

    const fileInput = document.getElementById("imageUpload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setIssue((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIssue(emptyIssue);
    onCancel();
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 col-span-2">
        <label className="block text-gray-700 mb-2">Image</label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
        {previewUrl && (
          <div className="mt-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-40 object-contain"
            />
          </div>
        )}
      </div>

      <Input
        type="text"
        name="title"
        value={issue.title}
        onChange={handleChange}
        placeholder="Issue Title"
        required
      />
      <Input
        type="text"
        name="agent"
        value={issue.agent}
        onChange={handleChange}
        placeholder="Agent"
      />
      <Input
        type="text"
        name="language"
        value={issue.language}
        onChange={handleChange}
        placeholder="Langauge"
      />
      <Textarea
        name="description"
        value={issue.description}
        onChange={handleChange}
        placeholder="Issue Description"
        required
      />
      <Select
        name="userType"
        value={issue.userType}
        onValueChange={(value) =>
          setIssue((prev) => ({ ...prev, userType: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="User Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="No selection">No selection</SelectItem>
          <SelectItem value="Client">Client</SelectItem>
          <SelectItem value="Interpreter">Interpreter</SelectItem>
          <SelectItem value="Partner">Partner</SelectItem>
          <SelectItem value="Agent">Agent</SelectItem>
        </SelectContent>
      </Select>
      <Select
        name="VPN"
        value={issue.VPN}
        onValueChange={(value) => setIssue((prev) => ({ ...prev, VPN: value }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="VPN" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="No selection">No selection</SelectItem>
          <SelectItem value="Yes">Yes</SelectItem>
          <SelectItem value="No">No</SelectItem>
        </SelectContent>
      </Select>
      <Select
        name="internetSource"
        value={issue.internetSource}
        onValueChange={(value) =>
          setIssue((prev) => ({ ...prev, internetSource: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="internetSource" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="No selection">No selection</SelectItem>
          <SelectItem value="Wifi">Wifi</SelectItem>
          <SelectItem value="LAN">LAN</SelectItem>
        </SelectContent>
      </Select>
      <Select
        name="category"
        value={issue.category}
        onValueChange={(value) =>
          setIssue((prev) => ({ ...prev, category: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="No selection">No solection</SelectItem>
          <SelectItem value="No answer">No answer</SelectItem>
          <SelectItem value="Ghost calls">Ghost calls</SelectItem>
          <SelectItem value="Language errors">Language errors</SelectItem>
          <SelectItem value="Partner issues">Partner issues</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="datetime-local"
        name="dateOfIncident"
        value={issue.dateOfIncident.split(".")[0]}
        onChange={handleChange}
        required
      />
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialIssue ? "Update Issue" : "Create Issue"}
        </Button>
      </div>
    </form>
  );
}

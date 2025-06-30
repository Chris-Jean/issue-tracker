"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SmartInput from "@/components/ui/SmartInput";
import { Issue, ConvexIssue } from "./types";
import {
  serviceNumbers,
  projectNames,
  clients,
  reason,
  categories,
  initialLanguages,
} from "./data/issueOptions";

interface IssueFormProps {
  onSubmit: (issue: Issue, previewUrl: File | null) => void;
  initialIssue?: Issue;
  onCancel: () => void;
}

const getFormattedLocalDate = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16);
};

const emptyIssue: ConvexIssue = {
  title: "",
  agent: "",
  language: "",
  description: "",
  userType: "",
  internetSource: "",
  category: "",
  reason: "",
  dateOfIncident: getFormattedLocalDate(),
};

const serviceProjectMap = new Map<string, string>();
serviceNumbers.forEach((num, i) => {
  const cleanService = num.trim();
  const cleanProject = projectNames[i]?.trim();
  if (cleanService && cleanProject) {
    serviceProjectMap.set(cleanService, cleanProject);
  }
});

 /* 🧩 Link Project Name to Service #
  useEffect(() => {
    const index = serviceNumbers.indexOf(issue.agent);
    if (index !== -1 && projectNames[index]) {
      setIssue((prev) => ({ ...prev, internetSource: projectNames[index] }));
    }
  }, [issue.agent]);*/

export default function IssueForm({
  onSubmit,
  initialIssue,
  onCancel,
}: IssueFormProps) {
  const [issue, setIssue] = useState<Issue>(emptyIssue);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [languages, setLanguages] = useState(initialLanguages);
  const [enlargedPreview, setEnlargedPreview] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEnlargedPreview(null);
      }
    };
  
    if (enlargedPreview) {
      window.addEventListener("keydown", handleEsc);
    }
  
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [enlargedPreview]);

  useEffect(() => {
    if (initialIssue) {
      setIssue(initialIssue);
    } else {
      setIssue(emptyIssue);
    }
  }, [initialIssue]);

  useEffect(() => {
    const trimmedAgent = issue.agent.trim();
    const mappedProject = serviceProjectMap.get(trimmedAgent);
    if (mappedProject) {
      setIssue((prev) => ({ ...prev, internetSource: mappedProject }));
    }
  }, [issue.agent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(issue, selectedImage);
    setIssue(emptyIssue);
    setSelectedImage(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById("imageUpload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setIssue((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 🖼 Image Upload */}
      <div className="mb-4 col-span-2">
        <label className="block text-muted-foreground mb-2">Image</label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-input rounded bg-input text-foreground"
        />
        {previewUrl && (
          <div className="mt-2">
            <Image
              src={previewUrl}
              alt="Preview"
              width={160}
              height={160}
              className="object-contain cursor-pointer rounded border"
              onClick={() => setEnlargedPreview(previewUrl)}
            />
          </div>
        )}
      </div>

      {/* 📌 Category */}
      <select
        name="category"
        value={issue.category}
        onChange={handleChange}
        className="w-full p-2 rounded border border-input bg-input text-foreground focus:outline-none focus:ring focus:ring-ring"
        required
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* ☎️ Caller ID */}
      <Input
        type="text"
        name="title"
        value={issue.title}
        onChange={handleChange}
        placeholder="Caller ID"
        required
      />

      {/* 🔢 Service # */}
      <SmartInput
        label="Service #"
        name="agent"
        value={issue.agent}
        onChange={(val) =>
          setIssue((prev) => ({ ...prev, agent: val.trim() }))
        }
        options={serviceNumbers}
        placeholder="Enter or search Service #"
      />

      {/* 📁 Client */}
      <SmartInput
        label="Client"
        name="userType"
        value={issue.userType}
        onChange={(val) => setIssue((prev) => ({ ...prev, userType: val }))}
        options={clients}
        placeholder="Enter or search Client"
      />

      {/* 📌 Project Name */}
      <SmartInput
        label="Project Name"
        name="internetSource"
        value={issue.internetSource}
        onChange={(val) =>
          setIssue((prev) => ({ ...prev, internetSource: val }))
        }
        options={projectNames}
        placeholder="Enter or search Project Name"
      />

      {/* 🧠 Language */}
      <div className="relative">
        <Input
          name="language"
          value={issue.language}
          onChange={(e) => {
            const value = e.target.value;
            setIssue((prev) => ({ ...prev, language: value }));
            setQuery(value);
            if (value && !languages.includes(value)) {
              setLanguages((prev) => [...prev, value]);
            }
          }}
          placeholder="Language"
        />
        {query.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-card border border-border rounded shadow max-h-40 overflow-auto">
            {languages
              .filter((lang) =>
                lang.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 10)
              .map((lang) => (
                <li
                  key={lang}
                  onClick={() => {
                    setIssue((prev) => ({ ...prev, language: lang }));
                    setQuery("");
                  }}
                  className="p-2 hover:bg-muted cursor-pointer"
                >
                  {lang}
                </li>
              ))}
            {!languages.includes(query) && query.trim() !== "" && (
              <li
                onClick={() => {
                  setLanguages((prev) => [...prev, query]);
                  setIssue((prev) => ({ ...prev, language: query }));
                  setQuery("");
                }}
                className="p-2 hover:bg-accent/10 text-sm text-accent cursor-pointer"
              >
                &#43; Add &quot;{query}&quot;
              </li>
            )}
          </ul>
        )}
      </div>

      {/* ❓ Reason */}
      <SmartInput
        label="Reason"
        name="reason"
        value={issue.reason ?? ""}
        onChange={(val) => setIssue((prev) => ({ ...prev, reason: val }))}
        options={reason}
        placeholder="Enter or search Reason"
        className="w-full p-2 bg-input text-foreground border border-input rounded"
      />

      {/* 📝 Description */}
      <Textarea
        name="description"
        value={issue.description}
        onChange={handleChange}
        placeholder="Description"
        required
        className="bg-input text-foreground border border-input"
      />

      {/* 📅 Date */}
      <Input
        type="datetime-local"
        name="dateOfIncident"
        value={issue.dateOfIncident}
        onChange={handleChange}
        required
      />

      {/* 🎯 Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialIssue ? "Update Issue" : "Create Issue"}
        </Button>
      </div>

      {/* 🔍 Modal for Enlarged Image */}
      {enlargedPreview && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
          onClick={() => setEnlargedPreview(null)}
        >
          <Image
            src={enlargedPreview}
            alt="Enlarged preview"
            width={800}
            height={800}
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </form>
  );
}

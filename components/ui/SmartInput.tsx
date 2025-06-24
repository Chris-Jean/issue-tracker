"use client";
import { useState } from "react";

type SmartInputProps = {
  label: string;
  name: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string; // ✅ Add this line
};

export default function SmartInput({
  name,
  label,
  value,
  options,
  placeholder,
  onChange,
}: SmartInputProps) {
  const [query, setQuery] = useState("");

  const filtered = options
    .filter((opt) => opt.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10); // limit to 10 results

  return (
    <div className="relative">
      {label && (
        <label className="block mb-1 text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        name={name}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setQuery(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full p-2 rounded border border-input bg-input text-foreground focus:outline-none focus:ring focus:ring-ring"
        autoComplete="off"
      />
      {query && (
        <ul className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto rounded border border-border bg-card text-foreground shadow">
          {filtered.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setQuery("");
              }}
              className="p-2 cursor-pointer hover:bg-muted"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState } from "react"; // ⬅️ removed unused useEffect import
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { X, Database, Trash2, Plus, Info, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DevSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DevSettingsModal({ isOpen, onClose }: DevSettingsModalProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  // Convex functions
  const generateDemo = useMutation(api.demoData.generateDemoData);
  const wipeDemo = useMutation(api.demoData.wipeDemoData);
  const demoCount = useQuery(api.demoData.countDemoData);
  const dbStats = useQuery(api.demoData.getDatabaseStats);

  // Form state
  const [demoSettings, setDemoSettings] = useState({
    count: 100,
    daysBack: 30,
  });

  if (!isOpen) return null;

  const handleGenerateDemo = async () => {
    setIsGenerating(true);
    try {
      const result = await generateDemo({
        count: demoSettings.count,
        daysBack: demoSettings.daysBack,
      });

      toast({
        title: "✅ Demo Data Generated",
        description: `Created ${result.count} demo issues`,
      });
    } catch {
      // ⬅️ removed unused `error` variable
      toast({
        title: "❌ Error",
        description: "Failed to generate demo data",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWipeDemo = async () => {
    if (!confirm("Are you sure you want to delete all demo data?")) {
      return;
    }

    setIsWiping(true);
    try {
      const result = await wipeDemo();

      toast({
        title: "🗑️ Demo Data Wiped",
        description: `Deleted ${result.count} demo issues`,
      });
    } catch {
      // ⬅️ removed unused `error` variable
      toast({
        title: "❌ Error",
        description: "Failed to wipe demo data",
        variant: "destructive",
      });
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Dev Settings</h2>
              <p className="text-sm text-muted-foreground">
                Development tools & debugging
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Database Stats */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Database Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Issues" value={dbStats?.total ?? 0} />
              <StatCard label="Active Issues" value={dbStats?.active ?? 0} color="text-green-500" />
              <StatCard label="Demo Issues" value={dbStats?.demo ?? 0} color="text-blue-500" />
              <StatCard label="Real Issues" value={dbStats?.real ?? 0} color="text-purple-500" />
              <StatCard label="Archived" value={dbStats?.archived ?? 0} color="text-yellow-500" />
              <StatCard label="Deleted" value={dbStats?.deleted ?? 0} color="text-red-500" />
            </div>
          </div>

          {/* Demo Data Controls */}
          {/* (unchanged below this line) */}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  color = "text-foreground",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

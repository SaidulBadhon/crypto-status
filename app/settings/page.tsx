"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Trash2, RefreshCw, Save } from "lucide-react";

const CACHE_EXPIRY_OPTIONS = [
  { value: 5, label: "5 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: 360, label: "6 hours" },
  { value: 720, label: "12 hours" },
  { value: 1440, label: "24 hours" },
];

export default function Settings() {
  const [binId, setBinId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [cacheExpiry, setCacheExpiry] = useState(30);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Load settings from localStorage or environment variables
    const storedBinId =
      localStorage.getItem("binId") || process.env.NEXT_PUBLIC_BIN_ID || "";
    const storedApiKey =
      localStorage.getItem("apiKey") || process.env.NEXT_PUBLIC_API_KEY || "";
    const storedCacheExpiry = parseInt(
      localStorage.getItem("cacheExpiry") || "30",
      10
    );

    setBinId(storedBinId);
    setApiKey(storedApiKey);
    setCacheExpiry(storedCacheExpiry);
  }, []);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });

    try {
      // Save settings to localStorage
      localStorage.setItem("binId", binId);
      localStorage.setItem("apiKey", apiKey);
      localStorage.setItem("cacheExpiry", cacheExpiry.toString());

      setSaveMessage({
        type: "success",
        text: "Settings saved successfully!",
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: "Failed to save settings. Please try again.",
      });
    }

    setIsSaving(false);
  };

  const clearCache = () => {
    try {
      localStorage.removeItem("cryptoPortfolioCache");
      setSaveMessage({
        type: "success",
        text: "Cache cleared successfully!",
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: "Failed to clear cache. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your application preferences
        </p>
      </div>

      {saveMessage.text && (
        <div
          className={`p-4 rounded-md ${
            saveMessage.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure your JSONBin.io API settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="bin-id" className="block text-sm font-medium mb-1">
              Bin ID
            </label>
            <input
              id="bin-id"
              type="text"
              className="w-full p-2 border rounded-md bg-background"
              value={binId}
              onChange={(e) => setBinId(e.target.value)}
              placeholder="Enter your JSONBin.io Bin ID"
            />
          </div>

          <div>
            <label htmlFor="api-key" className="block text-sm font-medium mb-1">
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              className="w-full p-2 border rounded-md bg-background"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your JSONBin.io API Key"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cache Settings</CardTitle>
          <CardDescription>
            Configure how long data is cached locally
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="cache-expiry"
              className="block text-sm font-medium mb-1"
            >
              Cache Expiry Time
            </label>
            <select
              id="cache-expiry"
              className="w-full p-2 border rounded-md bg-background"
              value={cacheExpiry}
              onChange={(e) => setCacheExpiry(parseInt(e.target.value, 10))}
            >
              {CACHE_EXPIRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={clearCache}
              className="inline-flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent transition-colors rounded-md"
            >
              <Trash2 className="h-4 w-4" /> Clear Cache
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              This will force the app to fetch fresh data from the API on the
              next request.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md"
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Trash2, RefreshCw, Save, AlertCircle, Info } from "lucide-react";

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
  const [isClearing, setIsClearing] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Load settings from localStorage or environment variables
    const storedBinId =
      localStorage.getItem("binId") ||
      process.env.NEXT_PUBLIC_JSONBIN_BIN_ID ||
      "";
    const storedApiKey =
      localStorage.getItem("apiKey") ||
      process.env.NEXT_PUBLIC_JSONBIN_API_KEY ||
      "";
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
    } finally {
      setIsSaving(false);
    }
  };

  const clearCache = () => {
    setIsClearing(true);
    setSaveMessage({ type: "", text: "" });

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
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your application preferences
        </p>
      </div>

      {saveMessage.text && (
        <div
          className={`p-4 rounded-md flex items-start gap-2 ${
            saveMessage.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {saveMessage.type === "success" ? (
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure your JSONBin.io API settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="bin-id"
                className="block text-sm font-medium mb-1"
              >
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
              <p className="mt-1 text-xs text-muted-foreground">
                Your JSONBin.io bin identifier for storing portfolio data
              </p>
            </div>

            <div>
              <label
                htmlFor="api-key"
                className="block text-sm font-medium mb-1"
              >
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
              <p className="mt-1 text-xs text-muted-foreground">
                Your JSONBin.io master key for API access
              </p>
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
              <p className="mt-1 text-xs text-muted-foreground">
                How long to store portfolio data in your browser before
                refreshing from the server
              </p>
            </div>

            <div>
              <button
                onClick={clearCache}
                className="inline-flex items-center gap-2 px-4 py-2 border border-destructive text-destructive hover:bg-destructive/10 transition-colors rounded-md"
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Clear Cache
                  </>
                )}
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                This will force the app to fetch fresh data from the API on the
                next request
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Information about this application</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium">Crypto Portfolio Tracker</h3>
            <p className="text-sm text-muted-foreground mt-1">Version 1.0.0</p>
          </div>
          <div>
            <h3 className="font-medium">Technologies</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
              <li>Next.js 15</li>
              <li>React 19</li>
              <li>Tailwind CSS 4</li>
              <li>TypeScript</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Data Storage</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This application stores your portfolio data in JSONBin and caches
              it in your browser's local storage for faster access. No personal
              data is collected.
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

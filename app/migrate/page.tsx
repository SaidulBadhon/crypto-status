"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { importPortfolioData } from "@/lib/api";
import { PortfolioItem } from "@/types";
import { AlertCircle, Database, ArrowLeft, RefreshCw } from "lucide-react";

export default function MigratePage() {
  const router = useRouter();
  const [jsonBinId, setJsonBinId] = useState("");
  const [jsonBinApiKey, setJsonBinApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const handleMigrate = async () => {
    if (!jsonBinId || !jsonBinApiKey) {
      setResult({
        success: false,
        message: "Please enter both JSONBin ID and API Key",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Fetch data from JSONBin
      const response = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinId}/latest`, {
        headers: {
          'X-Master-Key': jsonBinApiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch from JSONBin: ${response.status} ${response.statusText}`);
      }

      const jsonBinData = await response.json();
      const portfolioData = jsonBinData.record as PortfolioItem[];

      if (!Array.isArray(portfolioData) || portfolioData.length === 0) {
        throw new Error("No valid portfolio data found in JSONBin");
      }

      // Import data to MongoDB
      const importResult = await importPortfolioData(portfolioData);

      setResult({
        success: true,
        message: importResult.message,
        count: importResult.importedCount,
      });
    } catch (error: any) {
      console.error("Migration error:", error);
      setResult({
        success: false,
        message: error.message || "Failed to migrate data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Migrate from JSONBin</h1>
        <p className="text-muted-foreground">
          Transfer your portfolio data from JSONBin to our MongoDB database
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Migration Tool</CardTitle>
          <CardDescription>
            Enter your JSONBin credentials to migrate your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="jsonbin-id" className="block text-sm font-medium mb-1">
              JSONBin ID
            </label>
            <input
              id="jsonbin-id"
              type="text"
              className="w-full p-2 border rounded-md bg-background"
              value={jsonBinId}
              onChange={(e) => setJsonBinId(e.target.value)}
              placeholder="Enter your JSONBin ID"
            />
          </div>

          <div>
            <label htmlFor="jsonbin-api-key" className="block text-sm font-medium mb-1">
              JSONBin API Key
            </label>
            <input
              id="jsonbin-api-key"
              type="password"
              className="w-full p-2 border rounded-md bg-background"
              value={jsonBinApiKey}
              onChange={(e) => setJsonBinApiKey(e.target.value)}
              placeholder="Enter your JSONBin API Key"
            />
          </div>

          {result && (
            <div
              className={`p-4 rounded-md flex items-start gap-2 ${
                result.success
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{result.success ? "Success!" : "Error"}</p>
                <p>{result.message}</p>
                {result.success && result.count && (
                  <p className="mt-1">
                    Successfully migrated {result.count} portfolio entries.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <button
            onClick={() => router.push("/portfolio")}
            className="px-4 py-2 border border-input bg-background hover:bg-accent transition-colors rounded-md flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </button>
          <button
            onClick={handleMigrate}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Migrate Data
              </>
            )}
          </button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Migration Information</CardTitle>
          <CardDescription>
            Important details about the migration process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">What This Does</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This tool will copy all your portfolio data from JSONBin to our MongoDB database.
              Your existing data in JSONBin will not be modified or deleted.
            </p>
          </div>

          <div>
            <h3 className="font-medium">After Migration</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Once migration is complete, all your portfolio data will be available in the app
              as before. New entries will be saved to MongoDB instead of JSONBin.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Privacy & Security</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your JSONBin credentials are only used for this one-time migration and are not stored.
              All data is transferred securely.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

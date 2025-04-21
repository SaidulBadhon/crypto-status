"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { addPortfolioEntry, addMultiplePortfolioEntries } from "@/lib/api";
import { setCache, getCachedPortfolio } from "@/lib/cacheHelper";
import { PortfolioItem } from "@/types";
import { AlertCircle, Save, ArrowLeft } from "lucide-react";

export default function AddEntry() {
  const router = useRouter();

  const [newEntryText, setNewEntryText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate a sample entry with current date
  const generateSampleEntry = (isArray = false) => {
    const now = new Date().toISOString();
    const sample = {
      createdAt: now,
      total: "$10,000.00",
      crypto: [
        {
          name: "BTC",
          amount: "0.25",
          amountInUsdt: "7,500",
          parPrice: "$30,000",
        },
        {
          name: "ETH",
          amount: "1.25",
          amountInUsdt: "2,500",
          parPrice: "$2,000",
        },
      ],
    };

    if (isArray) {
      // Create a second sample with a different timestamp (1 hour later)
      const laterTime = new Date(
        new Date(now).getTime() + 60 * 60 * 1000
      ).toISOString();
      const secondSample = {
        ...sample,
        createdAt: laterTime,
        total: "$10,500.00",
        crypto: [
          {
            name: "BTC",
            amount: "0.27",
            amountInUsdt: "8,100",
            parPrice: "$30,000",
          },
          {
            name: "ETH",
            amount: "1.2",
            amountInUsdt: "2,400",
            parPrice: "$2,000",
          },
        ],
      };
      return JSON.stringify([sample, secondSample], null, 2);
    }

    return JSON.stringify(sample, null, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError("");
    setIsSubmitting(true);

    try {
      // Parse JSON
      let parsedData: PortfolioItem | PortfolioItem[];
      try {
        parsedData = JSON.parse(newEntryText);
      } catch (err) {
        setJsonError("Invalid JSON format. Please check your input.");
        setIsSubmitting(false);
        return;
      }

      // Get existing portfolio
      const existingPortfolio = getCachedPortfolio() || [];

      // Check if it's an array or a single object
      if (Array.isArray(parsedData)) {
        // Handle array of portfolio items
        const portfolioItems = parsedData as PortfolioItem[];

        // Validate each item
        for (const item of portfolioItems) {
          // Validate required fields
          if (!item.createdAt) {
            throw new Error(
              `Missing required field: createdAt in one of the entries`
            );
          }
          if (!item.total) {
            throw new Error(
              `Missing required field: total in one of the entries`
            );
          }
          if (
            !item.crypto ||
            !Array.isArray(item.crypto) ||
            item.crypto.length === 0
          ) {
            throw new Error(
              `Missing or invalid field: crypto (must be a non-empty array) in one of the entries`
            );
          }

          // Validate crypto items
          for (const crypto of item.crypto) {
            if (!crypto.name) throw new Error(`Missing name in crypto item`);
            if (!crypto.amount)
              throw new Error(`Missing amount for ${crypto.name}`);
            if (!crypto.amountInUsdt)
              throw new Error(`Missing amountInUsdt for ${crypto.name}`);
            if (!crypto.parPrice)
              throw new Error(`Missing parPrice for ${crypto.name}`);
          }

          // Check for duplicate entry
          const isDuplicate = existingPortfolio.some(
            (existingItem) => existingItem.createdAt === item.createdAt
          );
          if (isDuplicate) {
            throw new Error(
              `An entry with timestamp ${item.createdAt} already exists. Please use different timestamps.`
            );
          }
        }

        // Add multiple items to MongoDB
        await addMultiplePortfolioEntries(portfolioItems);

        // Update cache with the new items added to existing portfolio
        const updatedPortfolio = [...existingPortfolio, ...portfolioItems];
        setCache(updatedPortfolio);

        // Success - clear form and navigate
        setNewEntryText("");
        setJsonError("");
        router.push("/portfolio");
      } else {
        // Handle single portfolio item
        const newItem = parsedData as PortfolioItem;

        // Validate required fields
        if (!newItem.createdAt) {
          throw new Error("Missing required field: createdAt");
        }
        if (!newItem.total) {
          throw new Error("Missing required field: total");
        }
        if (
          !newItem.crypto ||
          !Array.isArray(newItem.crypto) ||
          newItem.crypto.length === 0
        ) {
          throw new Error(
            "Missing or invalid field: crypto (must be a non-empty array)"
          );
        }

        // Validate crypto items
        for (const crypto of newItem.crypto) {
          if (!crypto.name) throw new Error(`Missing name in crypto item`);
          if (!crypto.amount)
            throw new Error(`Missing amount for ${crypto.name}`);
          if (!crypto.amountInUsdt)
            throw new Error(`Missing amountInUsdt for ${crypto.name}`);
          if (!crypto.parPrice)
            throw new Error(`Missing parPrice for ${crypto.name}`);
        }

        // Check for duplicate entry
        const isDuplicate = existingPortfolio.some(
          (item) => item.createdAt === newItem.createdAt
        );
        if (isDuplicate) {
          throw new Error(
            "An entry with this timestamp already exists. Please use a different timestamp."
          );
        }

        // Add new item to MongoDB
        await addPortfolioEntry(newItem);

        // Update cache with the new item added to existing portfolio
        const updatedPortfolio = [...existingPortfolio, newItem];
        setCache(updatedPortfolio);

        // Success - clear form and navigate
        setNewEntryText("");
        setJsonError("");
        router.push("/portfolio");
      }
    } catch (err) {
      console.error("Failed to save portfolio entry:", err);
      setJsonError(
        err instanceof Error
          ? err.message
          : "Failed to save portfolio entry. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/portfolio");
  };

  const handleUseSample = (isArray: boolean = false) => {
    setNewEntryText(generateSampleEntry(isArray));
    setJsonError("");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Add Portfolio Entry</h1>
        <p className="text-muted-foreground">
          Add a new snapshot of your crypto portfolio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Portfolio Entry</CardTitle>
          <CardDescription>
            Paste your portfolio data in JSON format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="portfolio-json"
                  className="block text-sm font-medium"
                >
                  Portfolio JSON
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleUseSample(false)}
                    className="text-xs text-primary hover:underline"
                  >
                    Use Single Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseSample(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Use Multiple Samples
                  </button>
                </div>
              </div>
              <textarea
                id="portfolio-json"
                className="w-full h-64 p-3 border rounded-md font-mono text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={`Paste JSON in one of these formats:

// Single entry:
{
  "createdAt": "2023-06-01T12:00:00Z",
  "total": "$10,000.00",
  "crypto": [
    {
      "name": "BTC",
      "amount": "0.5",
      "amountInUsdt": "15,000",
      "parPrice": "$30,000"
    },
    ...
  ]
}

// OR multiple entries as an array:
[
  {
    "createdAt": "2023-06-01T12:00:00Z",
    "total": "$10,000.00",
    "crypto": [...]
  },
  {
    "createdAt": "2023-06-02T12:00:00Z",
    "total": "$10,500.00",
    "crypto": [...]
  }
]`}
                value={newEntryText}
                onChange={(e) => setNewEntryText(e.target.value)}
                required
              />
              {jsonError && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {jsonError}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-input bg-background hover:bg-accent transition-colors rounded-md flex items-center gap-2"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Save className="h-4 w-4 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Entry
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JSON Format Guide</CardTitle>
          <CardDescription>
            Follow this structure for your portfolio data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
            {`// Single Entry Format
{
  "createdAt": "2023-06-01T12:00:00Z",  // ISO date string
  "total": "$10,000.00",                // Total portfolio value
  "crypto": [
    {
      "name": "BTC",                    // Cryptocurrency symbol
      "amount": "0.5",                  // Amount owned
      "amountInUsdt": "15,000",         // Value in USDT
      "parPrice": "$30,000"             // Current price
    },
    {
      "name": "ETH",
      "amount": "5.0",
      "amountInUsdt": "10,000",
      "parPrice": "$2,000"
    }
  ]
}

// Multiple Entries Format (Array)
[
  {
    "createdAt": "2023-06-01T12:00:00Z",
    "total": "$10,000.00",
    "crypto": [ ... ]
  },
  {
    "createdAt": "2023-06-02T12:00:00Z",
    "total": "$10,500.00",
    "crypto": [ ... ]
  }
]`}
          </pre>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <p>
            Tip: Use the &quot;Use Single Sample&quot; or &quot;Use Multiple
            Samples&quot; buttons to get started with templates.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

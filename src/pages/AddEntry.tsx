import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { savePortfolioToJsonBin } from "../api/portfolioApi";
import { setCache, getCachedPortfolio } from "../lib/cacheHelper";

export default function AddEntry() {
  const navigate = useNavigate();
  const [newEntryText, setNewEntryText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError("");
    setIsSubmitting(true);

    try {
      // Validate JSON
      let newItem;
      try {
        newItem = JSON.parse(newEntryText);
        if (!newItem.createdAt || !newItem.total || !newItem.crypto) {
          throw new Error("Missing required fields: total, createdAt, crypto");
        }
      } catch (err) {
        setJsonError(
          err instanceof Error
            ? err.message
            : "Invalid JSON format. Please check your input."
        );
        setIsSubmitting(false);
        return;
      }

      // Get existing portfolio
      const existingPortfolio = getCachedPortfolio() || [];
      
      // Add new item
      const updatedPortfolio = [...existingPortfolio, newItem];
      
      // Save to JSONBin
      await savePortfolioToJsonBin(updatedPortfolio);
      
      // Update cache
      setCache(updatedPortfolio);
      
      // Success - clear form and navigate
      setNewEntryText("");
      setJsonError("");
      navigate("/portfolio");
    } catch (err) {
      console.error("Failed to save portfolio entry:", err);
      setJsonError(
        "Failed to save portfolio entry. Please try again later."
      );
    }
    
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    navigate("/portfolio");
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
              <label
                htmlFor="portfolio-json"
                className="block text-sm font-medium mb-1"
              >
                Portfolio JSON
              </label>
              <textarea
                id="portfolio-json"
                className="w-full h-64 p-3 border rounded-md font-mono text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={`Paste JSON in this format:
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
}`}
                value={newEntryText}
                onChange={(e) => setNewEntryText(e.target.value)}
                required
              />
              {jsonError && (
                <p className="mt-2 text-sm text-red-500">{jsonError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-input bg-background hover:bg-accent transition-colors rounded-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Entry"}
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
{`{
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
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

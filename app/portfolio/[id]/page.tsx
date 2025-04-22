"use client";
import { useEffect, useState } from "react";
import { deletePortfolioEntry, getPortfolioEntryById } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "@/components/image";
import moment from "moment";
import { ArrowLeft, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function PortfolioDetail() {
  const { id } = useParams<any>();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [portfolioItem, setPortfolioItem] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchPortfolio = async () => {
    setIsLoading(true);

    try {
      const data = await getPortfolioEntryById(id as string);

      console.log("PortfolioDetail", data);

      setPortfolioItem(data);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">Loading portfolio data...</p>
      </div>
    );
  }

  if (!portfolioItem) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Portfolio entry not found.</p>
        <Button
          onClick={() => router.push("/portfolio")}
          className="mt-4 inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Portfolio
        </Button>
      </div>
    );
  }

  // Handle delete portfolio entry
  const handleDelete = async () => {
    if (!portfolioItem._id) {
      console.error("Cannot delete: No portfolio ID found");
      return;
    }

    setIsDeleting(true);

    try {
      const success = await deletePortfolioEntry(portfolioItem._id);

      if (success) {
        // Close dialog and redirect to portfolio list
        setShowDeleteDialog(false);
        router.push("/portfolio");
      } else {
        console.error("Failed to delete portfolio entry");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting portfolio entry:", error);
      setIsDeleting(false);
    }
  };

  // Calculate total value in USDT
  const totalUSDT = portfolioItem.crypto.reduce(
    (sum: number, coin: any) =>
      sum + parseFloat(coin.amountInUsdt.replace(/,/g, "")),
    0
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/portfolio")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Portfolio
          </Button>

          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" /> Delete Entry
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Portfolio Details</h1>
          <p className="text-muted-foreground">
            {moment
              .utc(portfolioItem.createdAt)
              .format("MMMM D, YYYY [at] h:mm A")}
          </p>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
            <CardDescription>
              Total value and asset distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Total Value</h3>
                <p className="text-3xl font-bold">{portfolioItem.total}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalUSDT.toLocaleString()} USDT
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Asset Count</h3>
                <p className="text-3xl font-bold">
                  {portfolioItem.crypto.length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Different cryptocurrencies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>
              Detailed breakdown of all cryptocurrencies in this portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioItem.crypto.map((crypto: any) => {
                // Calculate percentage of total portfolio
                const usdtValue = parseFloat(
                  crypto.amountInUsdt.replace(/,/g, "")
                );
                const percentage = (usdtValue / totalUSDT) * 100;

                return (
                  <div
                    key={crypto.name}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        className="w-10 h-10 !rounded-md"
                        src={`https://assets.parqet.com/logos/crypto/${crypto.name}`}
                        name={crypto.name}
                        alt={crypto.name}
                      />
                      <div>
                        <h3 className="font-medium">{crypto.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {crypto.parPrice}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <p className="font-semibold">{crypto.amount}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {crypto.amountInUsdt} USDT
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this portfolio entry? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm font-medium">Entry details:</p>
            <p className="text-sm text-muted-foreground">
              Date:{" "}
              {moment
                .utc(portfolioItem.createdAt)
                .format("MMMM D, YYYY [at] h:mm A")}
            </p>
            <p className="text-sm text-muted-foreground">
              Total Value: {portfolioItem.total}
            </p>
            <p className="text-sm text-muted-foreground">
              Assets: {portfolioItem.crypto.length} cryptocurrencies
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

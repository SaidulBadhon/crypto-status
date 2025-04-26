"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeTransactionImageWithOpenAI, addTransaction } from "@/lib/api";
import { Transaction } from "@/types";
import {
  AlertCircle,
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";

export default function AddTransactionImagePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<Transaction | null>(null);
  const [jsonPreview, setJsonPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create a preview URL for the image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Reset any previous analysis
      setAnalyzedData(null);
      setJsonPreview("");
      setError(null);
      setSuccess(null);
    }
  };

  // Handle file removal
  const handleRemoveImage = () => {
    // Revoke the object URL to avoid memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(null);
    setPreviewUrl("");
    setAnalyzedData(null);
    setJsonPreview("");
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image analysis
  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      setError("Please select an image to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);

    try {
      // Create form data with the selected image
      const formData = new FormData();
      formData.append("image", selectedImage);

      // Call the API to analyze the image
      const result = await analyzeTransactionImageWithOpenAI(formData);

      if (result.success && result.transaction) {
        setAnalyzedData(result.transaction);
        setJsonPreview(JSON.stringify(result.transaction, null, 2));
        setSuccess("Image analyzed successfully");
      } else {
        setError("Failed to analyze image");
      }
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!analyzedData) {
      setError("Please analyze an image first");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Save the analyzed data to the database
      const result = await addTransaction(analyzedData);

      if (result) {
        setSuccess("Transaction saved successfully");

        // Clear the form after successful save
        setTimeout(() => {
          router.push("/transactions");
        }, 2000);
      } else {
        setError("Failed to save transaction");
      }
    } catch (err) {
      console.error("Error saving transaction:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save transaction"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/transactions");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Transactions
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Add Transaction from Image</h1>
        <p className="text-muted-foreground">
          Upload an image of your transaction and we&apos;ll extract the details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Select an image containing your crypto transaction data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Upload button */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={handleUploadClick}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Select Image
                  </Button>
                </div>

                {/* Image preview */}
                {previewUrl && (
                  <div className="relative group border rounded-md overflow-hidden aspect-video">
                    <img
                      src={previewUrl}
                      alt="Transaction preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Analyze button */}
                <div className="flex justify-center mt-4">
                  <Button
                    type="button"
                    onClick={handleAnalyzeImage}
                    disabled={!selectedImage || isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                  </div>
                )}

                {/* Success message */}
                {success && (
                  <div className="p-3 bg-green-100 border border-green-200 text-green-800 rounded-md flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>{success}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analyzed data */}
          {analyzedData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
                <CardDescription>
                  Review the extracted transaction details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Type</h3>
                      <p className="text-lg font-semibold">
                        {analyzedData.type.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Date</h3>
                      <p className="text-lg font-semibold">
                        {new Date(analyzedData.date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Coin</h3>
                      <p className="text-lg font-semibold">
                        {analyzedData.coin}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Amount</h3>
                      <p className="text-lg font-semibold">
                        {analyzedData.amount}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">
                        Price per Coin
                      </h3>
                      <p className="text-lg font-semibold">
                        ${analyzedData.pricePerCoin}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Total Value</h3>
                      <p className="text-lg font-semibold">
                        ${analyzedData.totalValue}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Fee</h3>
                      <p className="text-lg font-semibold">
                        ${analyzedData.fee}
                      </p>
                    </div>
                    {analyzedData.notes && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium mb-1">Notes</h3>
                        <p className="text-lg">{analyzedData.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Transaction
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
              <CardDescription>
                Helpful information for adding transactions from images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Image Quality</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  For best results, ensure your image is clear and all
                  transaction details are visible.
                </p>
              </div>

              <div>
                <h3 className="font-medium">Supported Information</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The system can extract transaction type (buy/sell), date, coin
                  symbol, amount, price, and fees.
                </p>
              </div>

              <div>
                <h3 className="font-medium">Review Carefully</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Always review the extracted information before saving to
                  ensure accuracy.
                </p>
              </div>

              <div>
                <h3 className="font-medium">Manual Editing</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  If the extracted data isn&apos;t perfect, you can add a
                  transaction manually from the transactions page.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* JSON Preview (for debugging) */}
          {jsonPreview && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>JSON Data</CardTitle>
                <CardDescription>
                  Raw data extracted from the image
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
                  {jsonPreview}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

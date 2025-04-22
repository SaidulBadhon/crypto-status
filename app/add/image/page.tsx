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
import { analyzeImagesWithOpenAI, addMultiplePortfolioEntries } from "@/lib/api";
import { PortfolioItem } from "@/types";
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

export default function ImageUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [analyzedData, setAnalyzedData] = useState<PortfolioItem[] | null>(null);
  const [jsonPreview, setJsonPreview] = useState<string>("");

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Create preview URLs for the selected images
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setSelectedImages(prev => [...prev, ...newFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      setError(null);
      setSuccess(null);
      setAnalyzedData(null);
      setJsonPreview("");
    }
  };

  // Handle file removal
  const handleRemoveImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    
    if (selectedImages.length === 1) {
      setAnalyzedData(null);
      setJsonPreview("");
    }
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image analysis
  const handleAnalyzeImages = async () => {
    if (selectedImages.length === 0) {
      setError("Please select at least one image to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);
    setAnalyzedData(null);
    setJsonPreview("");

    try {
      // Create form data with the selected images
      const formData = new FormData();
      selectedImages.forEach(image => {
        formData.append("images", image);
      });

      // Call the API to analyze the images
      const result = await analyzeImagesWithOpenAI(formData);
      
      if (result.success && result.portfolioItems) {
        setAnalyzedData(result.portfolioItems);
        setJsonPreview(JSON.stringify(result.portfolioItems, null, 2));
        setSuccess("Images analyzed successfully");
      } else {
        setError("Failed to analyze images");
      }
    } catch (err) {
      console.error("Error analyzing images:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze images");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle save to database
  const handleSaveToDatabase = async () => {
    if (!analyzedData || analyzedData.length === 0) {
      setError("No data to save. Please analyze images first.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Save the analyzed data to the database
      const result = await addMultiplePortfolioEntries(analyzedData);
      
      if (result.success) {
        setSuccess(`Successfully saved ${result.count} portfolio entries`);
        
        // Clear the form after successful save
        setTimeout(() => {
          router.push("/portfolio");
        }, 2000);
      } else {
        setError("Failed to save portfolio entries");
      }
    } catch (err) {
      console.error("Error saving portfolio entries:", err);
      setError(err instanceof Error ? err.message : "Failed to save portfolio entries");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/add");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Image Analysis</h1>
        <p className="text-muted-foreground">
          Upload images of your crypto portfolio to extract data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Select images containing your crypto portfolio data
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
              multiple
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
                Select Images
              </Button>
            </div>

            {/* Image previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative group border rounded-md overflow-hidden aspect-square"
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Analyze button */}
            {previewUrls.length > 0 && (
              <div className="flex justify-center mt-4">
                <Button
                  type="button"
                  onClick={handleAnalyzeImages}
                  disabled={isAnalyzing || selectedImages.length === 0}
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
                      Analyze with OpenAI
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-start gap-2 mt-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-green-500/15 text-green-500 p-3 rounded-md flex items-start gap-2 mt-4">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{success}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* JSON Preview */}
      {jsonPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Data</CardTitle>
            <CardDescription>
              Review the data extracted from your images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs max-h-96">
              {jsonPreview}
            </pre>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
              disabled={isSaving}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={isSaving || !analyzedData}
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
                  Save to Database
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Tips for getting the best results from image analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Supported Image Types</h3>
              <p className="text-sm text-muted-foreground">
                Upload clear images of your crypto portfolio data. The system works best with screenshots from exchanges or portfolio tracking apps.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Data Extraction</h3>
              <p className="text-sm text-muted-foreground">
                The system will attempt to extract the following information:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 ml-4">
                <li>Cryptocurrency names (BTC, ETH, etc.)</li>
                <li>Amount of each cryptocurrency</li>
                <li>Value in USDT for each cryptocurrency</li>
                <li>Price per coin</li>
                <li>Total portfolio value</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Best Practices</h3>
              <p className="text-sm text-muted-foreground">
                For best results:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 ml-4">
                <li>Use high-resolution images</li>
                <li>Ensure text is clearly visible</li>
                <li>Include column headers if possible</li>
                <li>Crop out unnecessary parts of the image</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

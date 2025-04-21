import { useState, useEffect } from "react";
import { getPortfolioFromMongo } from "../api/mongoApi";
import { RefreshCw } from "lucide-react";

export default function MongoDbStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [entryCount, setEntryCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const checkConnection = async () => {
    try {
      setIsRefreshing(true);
      const data = await getPortfolioFromMongo();
      setStatus("connected");
      setEntryCount(data.length);
      setErrorMessage("");
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unknown error occurred");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">MongoDB Connection Status</h3>
        <button
          onClick={checkConnection}
          className="p-1 rounded-md hover:bg-accent transition-colors"
          disabled={isRefreshing}
          title="Refresh connection status"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {status === "loading" && (
        <div className="flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
          <span>Checking connection...</span>
        </div>
      )}

      {status === "connected" && (
        <div className="space-y-2">
          <div className="text-green-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Connected to MongoDB
          </div>
          <div className="text-sm text-muted-foreground">
            {entryCount} {entryCount === 1 ? "entry" : "entries"} found in
            database
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="text-red-600">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Connection Error
          </div>
          <p className="text-sm mt-1">{errorMessage}</p>
          <div className="mt-3 text-xs text-muted-foreground">
            <p className="font-medium">Possible solutions:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>
                If using MongoDB Atlas: Make sure your IP is whitelisted in the
                MongoDB Atlas dashboard
              </li>
              <li>
                If using local MongoDB: Make sure MongoDB is installed and
                running on your machine
              </li>
              <li>Check your internet connection</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Conversation Not Found</h1>
        <p className="text-muted-foreground">
          The conversation you're looking for doesn't exist or may have been deleted.
        </p>
        <div className="flex gap-4 mt-4">
          <Button onClick={() => router.push("/copilot")}>
            Go to Copilot
          </Button>
        </div>
      </div>
    </div>
  );
}

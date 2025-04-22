"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ManualEntryRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main add page
    router.push("/add");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Redirecting to manual entry...</p>
    </div>
  );
}

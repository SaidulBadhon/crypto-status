"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Settings() {
  // All settings have been removed

  // No settings to load or save

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your application preferences
        </p>
      </div>

      {/* Settings removed */}

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
              This application stores your portfolio data in MongoDB. No
              personal data is collected.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save button removed */}
    </div>
  );
}

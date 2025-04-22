"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Key, AlertCircle } from "lucide-react";

// Get password from environment variables
// Using NEXT_PUBLIC_SITE_PASSWORD for client-side access
const PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD; // Default password

// Constants for authentication
const AUTH_STORAGE_KEY = "crypto_auth";
const MAX_ATTEMPTS = 3;
const AUTH_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface AuthState {
  authenticated: boolean;
  expiresAt: number;
  attempts: number;
  lockedUntil: number;
}

export default function PasswordProtection({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    expiresAt: 0,
    attempts: 0,
    lockedUntil: 0,
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth) as AuthState;
      const now = Date.now();

      // Check if authentication is still valid
      if (parsedAuth.authenticated && now < parsedAuth.expiresAt) {
        setAuthState(parsedAuth);
      }
      // Check if user is locked out
      else if (parsedAuth.lockedUntil > now) {
        setAuthState({
          ...parsedAuth,
          authenticated: false,
        });
        setError(`Too many failed attempts. Please try again later.`);
      }
      // Reset if expired but not locked out
      else if (parsedAuth.lockedUntil < now) {
        const newState = {
          authenticated: false,
          expiresAt: 0,
          attempts: 0,
          lockedUntil: 0,
        };
        setAuthState(newState);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
      }
    }

    setIsInitialized(true);
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    }
  }, [authState, isInitialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const now = Date.now();

    // Check if user is locked out
    if (authState.lockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (authState.lockedUntil - now) / (60 * 1000)
      );
      setError(
        `Too many failed attempts. Please try again in ${remainingMinutes} minute${
          remainingMinutes !== 1 ? "s" : ""
        }.`
      );
      setIsLoading(false);
      return;
    }

    // Simulate a slight delay for better UX
    setTimeout(() => {
      if (input === PASSWORD) {
        // Successful login
        setAuthState({
          authenticated: true,
          expiresAt: now + AUTH_DURATION,
          attempts: 0,
          lockedUntil: 0,
        });
      } else {
        // Failed login
        const newAttempts = authState.attempts + 1;
        const newLockedUntil =
          newAttempts >= MAX_ATTEMPTS ? now + LOCKOUT_DURATION : 0;

        setAuthState({
          authenticated: false,
          expiresAt: 0,
          attempts: newAttempts,
          lockedUntil: newLockedUntil,
        });

        if (newAttempts >= MAX_ATTEMPTS) {
          setError(`Too many failed attempts. Please try again in 60 minutes.`);
        } else {
          setError(
            `Incorrect password. ${MAX_ATTEMPTS - newAttempts} attempt${
              MAX_ATTEMPTS - newAttempts !== 1 ? "s" : ""
            } remaining.`
          );
        }
      }

      setIsLoading(false);
      setInput("");
    }, 800);
  };

  // If authenticated, render children
  if (authState.authenticated) {
    return <>{children}</>;
  }

  // Otherwise, render password form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Crypto Portfolio
            </CardTitle>
            <CardDescription className="text-center">
              Enter your password to access your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="pl-10"
                    disabled={isLoading || authState.lockedUntil > Date.now()}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading || !input || authState.lockedUntil > Date.now()
                }
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Access Portfolio"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Protected area. Unauthorized access is prohibited.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

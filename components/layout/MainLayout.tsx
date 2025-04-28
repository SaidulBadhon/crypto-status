"use client";

import {
  Moon,
  Sun,
  Menu,
  X,
  LayoutDashboard,
  Wallet,
  PlusCircle,
  Settings,
  Database,
  ArrowUpDown,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface NavLink {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    // Check if user has a preference stored
    const storedPreference = localStorage.getItem("darkMode");

    if (storedPreference !== null) {
      // Use stored preference
      const isDarkMode = storedPreference === "true";
      setDarkMode(isDarkMode);
      applyDarkMode(isDarkMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(prefersDark);
      applyDarkMode(prefersDark);
      localStorage.setItem("darkMode", String(prefersDark));
    }
  }, []);

  // Apply dark mode to document
  const applyDarkMode = useCallback((isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    applyDarkMode(newDarkMode);
  }, [darkMode, applyDarkMode]);

  // Close mobile menu
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  // Navigation links with icons
  const navLinks: NavLink[] = [
    {
      path: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      path: "/portfolio",
      label: "Portfolio",
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      path: "/transactions",
      label: "Transactions",
      icon: <ArrowUpDown className="h-4 w-4" />,
    },
    {
      path: "/add",
      label: "Add Entry",
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      path: "/copilot",
      label: "Copilot",
      icon: <Bot className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xl font-bold flex items-center gap-2"
            >
              <Wallet className="h-6 w-6 text-primary" />
              <span>Badhon&apos;s Portfolio</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`transition-colors hover:text-primary flex items-center gap-2 ${
                  pathname === link.path
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 px-4 bg-background border-t border-border animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`py-2 px-4 rounded-md transition-colors flex items-center gap-3 ${
                    pathname === link.path
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Crypto Portfolio. All rights reserved.
          </p>
          <p className="mt-2">
            <button
              onClick={toggleDarkMode}
              className="text-primary hover:underline"
            >
              Switch to {darkMode ? "light" : "dark"} mode
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}

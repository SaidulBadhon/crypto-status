"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Process the markdown content
  const processedContent = React.useMemo(() => {
    // Replace headers
    let processed = content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');

    // Replace bold and italic
    processed = processed
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/__(.*?)__/gim, '<strong>$1</strong>')
      .replace(/_(.*?)_/gim, '<em>$1</em>');

    // Replace links
    processed = processed.replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Replace unordered lists
    processed = processed.replace(
      /^\s*-\s+(.*$)/gim,
      '<li class="ml-4 list-disc">$1</li>'
    );
    processed = processed.replace(
      /^\s*\*\s+(.*$)/gim,
      '<li class="ml-4 list-disc">$1</li>'
    );

    // Replace ordered lists
    processed = processed.replace(
      /^\s*\d+\.\s+(.*$)/gim,
      '<li class="ml-4 list-decimal">$1</li>'
    );

    // Group list items
    processed = processed.replace(
      /<\/li>\s*<li/gim,
      '</li><li'
    );
    processed = processed.replace(
      /<li class="ml-4 list-disc">/gim,
      '<ul class="my-3"><li class="ml-4 list-disc">'
    );
    processed = processed.replace(
      /<li class="ml-4 list-decimal">/gim,
      '<ol class="my-3"><li class="ml-4 list-decimal">'
    );
    processed = processed.replace(
      /<\/li>\s*(?!<li)/gim,
      '</li></ul>'
    );
    processed = processed.replace(
      /<\/li><\/ul>\s*<ul[^>]*><li/gim,
      '</li><li'
    );
    processed = processed.replace(
      /<\/li><\/ul>\s*<ol[^>]*><li/gim,
      '</li><li'
    );

    // Replace code blocks
    processed = processed.replace(
      /```([a-z]*)\n([\s\S]*?)\n```/gim,
      '<pre class="bg-muted p-3 rounded-md my-3 overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>'
    );

    // Replace inline code
    processed = processed.replace(
      /`([^`]+)`/gim,
      '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>'
    );

    // Replace blockquotes
    processed = processed.replace(
      /^\s*>\s+(.*$)/gim,
      '<blockquote class="border-l-4 border-primary pl-4 italic my-3">$1</blockquote>'
    );

    // Replace paragraphs
    processed = processed.replace(
      /^\s*([^<].*)\s*$/gim,
      '<p class="my-2">$1</p>'
    );

    // Clean up empty paragraphs
    processed = processed.replace(/<p class="my-2"><\/p>/gim, '');

    // Fix nested paragraphs in lists
    processed = processed.replace(
      /<li[^>]*><p[^>]*>(.*?)<\/p><\/li>/gim,
      '<li class="ml-4">$1</li>'
    );

    return processed;
  }, [content]);

  return (
    <div 
      className={cn("markdown-content text-foreground", className)}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

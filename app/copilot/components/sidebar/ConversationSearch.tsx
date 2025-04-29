"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Calendar, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useCopilot } from "../../context/CopilotContext";

export type SortPeriod = "all" | "day" | "week" | "month";
export type GroupBy = "none" | "time";

interface ConversationSearchProps {
  onSearch: (query: string) => void;
  onSortChange: (period: SortPeriod) => void;
  onGroupChange: (groupBy: GroupBy) => void;
}

const ConversationSearchComponent = ({
  onSearch,
  onSortChange,
  onGroupChange,
}: ConversationSearchProps) => {
  // Get current values from context
  const { searchQuery: contextSearchQuery, sortPeriod, groupBy } = useCopilot();

  // Local state for the search input
  const [localSearchQuery, setLocalSearchQuery] = useState(contextSearchQuery);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Update local search query when context search query changes
  useEffect(() => {
    setLocalSearchQuery(contextSearchQuery);
  }, [contextSearchQuery]);

  // Use useCallback to memoize the event handler
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  }, []);

  // Apply the search when the debounced value changes
  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  return (
    <div className="space-y-2 px-2 py-2 group-data-[collapsible=icon]:px-0">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={localSearchQuery}
          onChange={handleSearch}
          className="pl-8 h-9 group-data-[collapsible=icon]:hidden"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 group-data-[collapsible=icon]:hidden">
        <Select
          value={sortPeriod}
          onValueChange={(value) => onSortChange(value as SortPeriod)}
        >
          <SelectTrigger className="w-full h-9">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="day">Last 24 hours</SelectItem>
            <SelectItem value="week">Last week</SelectItem>
            <SelectItem value="month">Last month</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={groupBy}
          onValueChange={(value) => onGroupChange(value as GroupBy)}
        >
          <SelectTrigger className="w-full h-9">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No grouping</SelectItem>
            <SelectItem value="time">Group by time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Export the component (memo was causing issues)
export const ConversationSearch = ConversationSearchComponent;

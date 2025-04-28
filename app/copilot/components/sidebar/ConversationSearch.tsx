"use client";

import { useState } from "react";
import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortPeriod = "all" | "day" | "week" | "month";
export type GroupBy = "none" | "time";

interface ConversationSearchProps {
  onSearch: (query: string) => void;
  onSortChange: (period: SortPeriod) => void;
  onGroupChange: (groupBy: GroupBy) => void;
}

export const ConversationSearch = ({
  onSearch,
  onSortChange,
  onGroupChange,
}: ConversationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="space-y-2 px-2 py-2 group-data-[collapsible=icon]:px-0">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-8 h-9 group-data-[collapsible=icon]:hidden"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 group-data-[collapsible=icon]:hidden">
        <Select
          defaultValue="all"
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
          defaultValue="none"
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

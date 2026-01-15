import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilterControlsProps {
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  viewMode: "daily" | "weekly" | "monthly";
  onViewModeChange: (mode: "daily" | "weekly" | "monthly") => void;
}

export default function FilterControls({
  dateRange,
  onDateRangeChange,
  viewMode,
  onViewModeChange,
}: FilterControlsProps) {
  const handleExport = () => {
    // TODO: Implement export functionality
    alert("Export functionality will be implemented");
  };

  return (
    <Card className="backdrop-blur-sm bg-card/90 border-border/50 shadow-lg mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                onDateRangeChange({ ...dateRange, start: e.target.value })
              }
              className="bg-background"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                onDateRangeChange({ ...dateRange, end: e.target.value })
              }
              className="bg-background"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">View Mode</label>
            <Select value={viewMode} onValueChange={(value: any) => onViewModeChange(value)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

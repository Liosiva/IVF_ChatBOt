import { Authenticated, Unauthenticated } from "convex/react";
import { useState } from "react";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import AnalyticsGrid from "@/components/staff/analytics-grid";
import ChartModules from "@/components/staff/chart-modules";
import FilterControls from "@/components/staff/filter-controls";
import { BarChart3, TrendingUp, MessageCircle } from "lucide-react";

export default function StaffDashboard() {
  const { isLoaded } = useUser();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");

  // Mock data until Convex is synced
  const analytics: Array<{ topic: string; count: number; date: string }> = [];
  const messageVolume: Record<string, number> = {};
  const topicAnalytics: Array<{ topic: string; count: number }> = [];

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate summary metrics
  const totalMessages = messageVolume
    ? Object.values(messageVolume).reduce((sum, count) => sum + count, 0)
    : 0;

  const totalTopics = topicAnalytics?.length || 0;

  const avgMessagesPerDay = messageVolume
    ? totalMessages / Object.keys(messageVolume).length
    : 0;

  return (
    <>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
      <Authenticated>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-5xl font-light text-foreground mb-3">
            Staff Analytics
          </h1>
          <p className="text-lg text-muted-foreground">
            Monitor patient engagement and topic trends
          </p>
        </div>

        <FilterControls
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-card/90 border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-light text-foreground">{totalMessages}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {dateRange.start} to {dateRange.end}
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-card/90 border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg. per Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-light text-foreground">
                {avgMessagesPerDay.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                messages per day
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-card/90 border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Topics Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-light text-foreground">{totalTopics}</div>
              <p className="text-xs text-muted-foreground mt-2">
                unique conversation topics
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AnalyticsGrid 
              analytics={analytics || []}
              messageVolume={messageVolume || {}}
            />
          </TabsContent>

          <TabsContent value="topics" className="space-y-6">
            <ChartModules
              type="topics"
              analytics={analytics || []}
              messageVolume={messageVolume || {}}
            />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <ChartModules
              type="trends"
              analytics={analytics || []}
              messageVolume={messageVolume || {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </Authenticated>
    </>
  );
}

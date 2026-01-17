import { useState, useEffect, Component, ReactNode } from "react";
import { RedirectToSignIn, useUser, useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import AnalyticsGrid from "@/components/staff/analytics-grid";
import ChartModules from "@/components/staff/chart-modules";
import FilterControls from "@/components/staff/filter-controls";
import { BarChart3, TrendingUp, MessageCircle } from "lucide-react";

// Error boundary for staff dashboard
class StaffErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Staff dashboard error:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <h2 className="text-xl font-semibold mb-4">Setting Up Analytics</h2>
              <p className="text-muted-foreground mb-4">
                The analytics dashboard is being configured. Please wait and refresh.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function StaffDashboardContent() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");
  
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  
  // Create or update user in Convex when signed in
  useEffect(() => {
    if (isSignedIn && user) {
      createOrUpdateUser().catch(console.error);
    }
  }, [isSignedIn, user, createOrUpdateUser]);

  // Only query Convex when user is signed in
  const analytics = useQuery(
    api.analytics.getAnalyticsByDateRange,
    isSignedIn ? { startDate: dateRange.start, endDate: dateRange.end } : "skip"
  );

  const messageVolume = useQuery(
    api.analytics.getMessageVolumeByDate,
    isSignedIn ? {
      startDate: new Date(dateRange.start).getTime(),
      endDate: new Date(dateRange.end).getTime(),
    } : "skip"
  );

  const topicAnalytics = useQuery(
    api.analytics.getTopicAnalytics,
    isSignedIn ? {} : "skip"
  );

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

  if (!user) {
    return <RedirectToSignIn />;
  }

  // Calculate summary metrics
  const totalMessages = messageVolume
    ? Object.values(messageVolume).reduce((sum, count) => sum + count, 0)
    : 0;

  const totalTopics = topicAnalytics?.length || 0;

  const avgMessagesPerDay = messageVolume && Object.keys(messageVolume).length > 0
    ? totalMessages / Object.keys(messageVolume).length
    : 0;

  return (
    <>
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
    </>
  );
}

export default function StaffDashboard() {
  return (
    <StaffErrorBoundary>
      <StaffDashboardContent />
    </StaffErrorBoundary>
  );
}

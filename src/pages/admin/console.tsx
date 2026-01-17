import { useState, useEffect, Component, ReactNode } from "react";
import { RedirectToSignIn, useUser, useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import UserManagementTable from "@/components/admin/user-management-table";
import ChatHistoryViewer from "@/components/admin/chat-history-viewer";
import StaffAccountPanel from "@/components/admin/staff-account-panel";
import { Users, MessageSquare, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Error boundary for admin console
class AdminErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Admin console error:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col bg-[#1C1C1E]">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Setting Up Admin Console</h2>
              <p className="text-gray-400 mb-4">
                The admin console is being configured. Please wait a moment and refresh.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#8B9D83] text-white rounded-md hover:bg-[#8B9D83]/90"
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

function AdminConsoleContent() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  
  // Create or update user in Convex when signed in
  useEffect(() => {
    if (isSignedIn && user) {
      createOrUpdateUser().catch(console.error);
    }
  }, [isSignedIn, user, createOrUpdateUser]);

  // Only query Convex when user is signed in
  const users = useQuery(api.admin.getAllUsers, isSignedIn ? undefined : "skip");
  const chatHistory = useQuery(api.admin.getAllChatHistory, isSignedIn ? { limit: 100 } : "skip");
  const systemStats = useQuery(api.admin.getSystemStats, isSignedIn ? undefined : "skip");

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#1C1C1E] text-[#FAFAF7]">
        <div className="container mx-auto py-8 px-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-5xl font-light mb-3">
            Admin Console
          </h1>
          <p className="text-lg text-gray-400">
            System oversight and user management
          </p>
        </div>

        {/* System Stats */}
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#2C2C2E] border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#FAFAF7]">{systemStats.totalUsers}</div>
                <p className="text-xs text-gray-500">
                  {systemStats.patientCount} patients, {systemStats.staffCount} staff, {systemStats.adminCount} admins
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#2C2C2E] border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Chat Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#FAFAF7]">{systemStats.totalSessions}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#2C2C2E] border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#FAFAF7]">{systemStats.totalMessages}</div>
                <p className="text-xs text-gray-500">
                  {systemStats.messagesLast7Days} in last 7 days
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#2C2C2E] border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Vector Embeddings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#FAFAF7]">{systemStats.vectorEmbeddings}</div>
                <p className="text-xs text-gray-500">RAG knowledge base</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#2C2C2E] border border-gray-700">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-[#8B9D83] data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger 
              value="chat-history"
              className="data-[state=active]:bg-[#8B9D83] data-[state=active]:text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat History
            </TabsTrigger>
            <TabsTrigger 
              value="staff"
              className="data-[state=active]:bg-[#8B9D83] data-[state=active]:text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Staff Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagementTable users={users || []} />
          </TabsContent>

          <TabsContent value="chat-history" className="space-y-6">
            <ChatHistoryViewer chatHistory={chatHistory || []} />
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <StaffAccountPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}

export default function AdminConsole() {
  return (
    <AdminErrorBoundary>
      <AdminConsoleContent />
    </AdminErrorBoundary>
  );
}

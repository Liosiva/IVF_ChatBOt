import { useState } from "react";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import UserManagementTable from "@/components/admin/user-management-table";
import ChatHistoryViewer from "@/components/admin/chat-history-viewer";
import StaffAccountPanel from "@/components/admin/staff-account-panel";
import { Users, MessageSquare, UserPlus, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminConsole() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("users");

  const users = useQuery(api.admin.getAllUsers);
  const chatHistory = useQuery(api.admin.getAllChatHistory, { limit: 100 });
  const systemStats = useQuery(api.admin.getSystemStats);

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

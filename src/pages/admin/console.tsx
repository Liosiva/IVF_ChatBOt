import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import UserManagementTable from "@/components/admin/user-management-table";
import ChatHistoryViewer from "@/components/admin/chat-history-viewer";
import StaffAccountPanel from "@/components/admin/staff-account-panel";
import { Users, MessageSquare, UserPlus } from "lucide-react";

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState("users");

  const users = useQuery(api.admin.getAllUsers);
  const chatHistory = useQuery(api.admin.getAllChatHistory, { limit: 100 });

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

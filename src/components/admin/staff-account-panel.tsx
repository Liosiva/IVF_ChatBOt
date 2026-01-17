import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function StaffAccountPanel() {
  const { isSignedIn } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createStaffAccount = useMutation(api.admin.createStaffAccount);
  const createAdminAccount = useMutation(api.admin.createAdminAccount);
  const staffUsers = useQuery(api.admin.getUsersByRole, isSignedIn ? { role: "staff" } : "skip");
  const activityLogs = useQuery(api.admin.getActivityLogs, isSignedIn ? { limit: 10 } : "skip");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createStaffAccount({
        name: formData.name,
        email: formData.email,
        tokenIdentifier: `staff_${Date.now()}`, // Temporary identifier until they sign in
      });
      toast.success("Staff account created successfully");
      setFormData({ name: "", email: "" });
    } catch (error) {
      toast.error("Failed to create staff account");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-[#2C2C2E] border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-light text-[#FAFAF7]">
          Create Staff Account
        </CardTitle>
        <CardDescription className="text-gray-400">
          Add new staff members who can access the analytics dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
              className="bg-[#1C1C1E] border-gray-700 text-[#FAFAF7]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@example.com"
              required
              className="bg-[#1C1C1E] border-gray-700 text-[#FAFAF7]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#8B9D83] hover:bg-[#7A8C72] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Create Staff Account
          </Button>
        </form>

        {/* Existing Staff Members */}
        {staffUsers && staffUsers.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-medium text-[#FAFAF7] mb-4">
              Current Staff Members ({staffUsers.length})
            </h3>
            <div className="space-y-2">
              {staffUsers.map((staff) => (
                <div key={staff._id} className="flex items-center justify-between p-3 bg-[#1C1C1E] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[#FAFAF7]">{staff.name || "—"}</p>
                    <p className="text-xs text-gray-400">{staff.email}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Shield className="h-3 w-3 mr-1" />
                    Staff
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {activityLogs && activityLogs.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-medium text-[#FAFAF7] mb-4">
              Recent Activity
            </h3>
            <div className="space-y-2">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log._id} className="p-3 bg-[#1C1C1E] rounded-lg">
                  <p className="text-sm text-[#FAFAF7]">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {log.userName} • {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-medium text-[#FAFAF7] mb-4">
            Staff Account Permissions
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Staff accounts have access to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
            <li>Analytics dashboard with question volume and topic trends</li>
            <li>Data export functionality</li>
            <li>Aggregated patient engagement metrics</li>
            <li>No access to individual patient chat content</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

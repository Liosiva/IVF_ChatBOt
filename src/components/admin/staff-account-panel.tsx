import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function StaffAccountPanel() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement staff account creation
    toast.success("Staff account created (mock)");
    setFormData({ name: "", email: "" });
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
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Staff Account
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-medium text-[#FAFAF7] mb-4">
            Staff Account Management
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

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface User {
  _id: Id<"users">;
  name?: string;
  email?: string;
  role: "patient" | "staff" | "admin";
  createdAt: number;
}

interface UserManagementTableProps {
  users: User[];
}

export default function UserManagementTable({ users }: UserManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  const clearUserHistory = useMutation(api.chatSessions.clearUserHistory);
  const updateUserRole = useMutation(api.admin.updateUserRole);

  const handleClearHistory = async (userId: Id<"users">) => {
    try {
      await clearUserHistory({ userId });
      toast.success("User history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
      console.error(error);
    }
  };

  const handleRoleChange = async (userId: Id<"users">, newRole: "patient" | "staff" | "admin") => {
    try {
      await updateUserRole({ userId, role: newRole });
      toast.success("User role updated");
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "staff":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#2C2C2E] border-gray-700"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] bg-[#2C2C2E] border-gray-700">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="patient">Patients</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-700 bg-[#2C2C2E]/50">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-transparent">
              <TableHead className="text-gray-300">Name</TableHead>
              <TableHead className="text-gray-300">Email</TableHead>
              <TableHead className="text-gray-300">Role</TableHead>
              <TableHead className="text-gray-300">Joined</TableHead>
              <TableHead className="text-gray-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id} className="border-gray-700 hover:bg-[#3C3C3E]/50">
                <TableCell className="font-mono text-sm">
                  {user.name || "—"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {user.email || "—"}
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value: any) => handleRoleChange(user._id, value)}
                  >
                    <SelectTrigger className="w-[120px] h-8 bg-transparent border-gray-600">
                      <Badge className={getRoleBadgeColor(user.role)} variant="outline">
                        {user.role}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#2C2C2E] border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-[#FAFAF7]">
                          Clear User History?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          This will permanently delete all chat sessions and messages for{" "}
                          {user.email}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-[#3C3C3E] border-gray-700">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleClearHistory(user._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Clear History
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-400">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}

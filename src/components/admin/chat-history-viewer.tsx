import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Search, Download, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  _id: Id<"chatMessages">;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  createdAt: number;
}

interface ChatHistoryViewerProps {
  chatHistory: ChatMessage[];
}

export default function ChatHistoryViewer({ chatHistory }: ChatHistoryViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const filteredHistory = chatHistory.filter((msg) =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const handleExport = () => {
    const csvContent = filteredHistory.map(msg => 
      `"${msg.role}","${msg.content.replace(/"/g, '""')}","${new Date(msg.createdAt).toISOString()}"`
    ).join('\n');
    
    const blob = new Blob([`"Role","Content","Timestamp"\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#2C2C2E] border-gray-700"
          />
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2 border-gray-700">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <ScrollArea className="h-[600px] rounded-lg border border-gray-700 bg-[#2C2C2E]/50">
        <Table>
          <TableHeader className="sticky top-0 bg-[#2C2C2E] z-10">
            <TableRow className="border-gray-700 hover:bg-transparent">
              <TableHead className="text-gray-300 w-[50px]"></TableHead>
              <TableHead className="text-gray-300 w-[100px]">Role</TableHead>
              <TableHead className="text-gray-300">Content</TableHead>
              <TableHead className="text-gray-300 w-[180px]">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((message) => {
              const isExpanded = expandedMessages.has(message._id);
              const preview = message.content.slice(0, 100);
              const needsTruncation = message.content.length > 100;

              return (
                <TableRow key={message._id} className="border-gray-700 hover:bg-[#3C3C3E]/50">
                  <TableCell>
                    {needsTruncation && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(message._id)}
                        className="h-6 w-6 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        message.role === "user"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      }
                    >
                      {message.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="max-w-2xl">
                      {isExpanded ? message.content : preview}
                      {needsTruncation && !isExpanded && "..."}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          Sources: {message.sources.join(", ")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="text-sm text-gray-400">
        Showing {filteredHistory.length} of {chatHistory.length} messages
      </div>
    </div>
  );
}

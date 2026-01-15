import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface AnalyticsData {
  topic: string;
  count: number;
  date: string;
}

interface AnalyticsGridProps {
  analytics: AnalyticsData[];
  messageVolume: Record<string, number>;
}

export default function AnalyticsGrid({ analytics, messageVolume }: AnalyticsGridProps) {
  // Aggregate topics
  const topicCounts = analytics.reduce((acc, item) => {
    acc[item.topic] = (acc[item.topic] || 0) + item.count;
    return acc;
  }, {} as Record<string, number>);

  const topicData = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const volumeData = Object.entries(messageVolume)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14); // Last 14 days

  const COLORS = ['#8B9D83', '#6B7C93', '#E89B8C', '#3A5F5C', '#A8B5A0', '#8999AB', '#F0ADA3', '#5A7A77'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="backdrop-blur-sm bg-card/90 border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-light">Top Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="topic" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#8B9D83" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-card/90 border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-light">Topic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topicData.slice(0, 8)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ topic, percent }) => `${topic} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {topicData.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-card/90 border-border/50 shadow-lg lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl font-light">Message Volume (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#6B7C93" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

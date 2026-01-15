import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface AnalyticsData {
  topic: string;
  count: number;
  date: string;
}

interface ChartModulesProps {
  type: "topics" | "trends";
  analytics: AnalyticsData[];
  messageVolume: Record<string, number>;
}

export default function ChartModules({ type, analytics, messageVolume }: ChartModulesProps) {
  if (type === "topics") {
    const topicCounts = analytics.reduce((acc, item) => {
      acc[item.topic] = (acc[item.topic] || 0) + item.count;
      return acc;
    }, {} as Record<string, number>);

    const topicData = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    return (
      <Card className="backdrop-blur-sm bg-card/90 border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-light">All Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={topicData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" fontSize={12} />
              <YAxis 
                dataKey="topic" 
                type="category" 
                width={150}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#8B9D83" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  // Trends view
  const volumeData = Object.entries(messageVolume)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card className="backdrop-blur-sm bg-card/90 border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-light">Message Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={volumeData}>
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
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#8B9D83" 
              strokeWidth={3}
              dot={{ fill: '#8B9D83', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

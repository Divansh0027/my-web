const fs = require('fs');
let content = fs.readFileSync('src/features/admin/components/AdminAnalytics.tsx', 'utf8');

content = content.replace(
  "export default function AnalyticsPanel() {",
  `interface BehaviorEvent {
  id: string;
  eventName?: string;
  timestamp?: any;
  userId?: string;
  sessionId?: string;
  [key: string]: any;
}

interface ChartData {
  name: string;
  views: number;
  properties: number;
}

export default function AnalyticsPanel() {`
);

content = content.replace(
  "const [behaviorData, setBehaviorData] = useState<any[]>([])",
  "const [behaviorData, setBehaviorData] = useState<BehaviorEvent[]>([])"
);

content = content.replace(
  "const [chartData, setChartData] = useState<any[]>([])",
  "const [chartData, setChartData] = useState<ChartData[]>([])"
);

content = content.replace(
  "const events: any[] = []",
  "const events: BehaviorEvent[] = []"
);

fs.writeFileSync('src/features/admin/components/AdminAnalytics.tsx', content);

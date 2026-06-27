import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScoreKey, SiteMetric } from "../../types/analytics";
import { scoreToPercent } from "../../utils/format";

interface SiteScoreBarsProps {
  data: SiteMetric[];
  scoreKey: ScoreKey;
  color?: string;
}

const labels: Record<ScoreKey, string> = {
  outreachLoadScore: "Outreach load",
  referralScore: "Referral",
  riskIntensityScore: "Risk intensity",
  followupPriorityScore: "Follow-up",
};

export default function SiteScoreBars({
  data,
  scoreKey,
  color = "#39ff14",
}: SiteScoreBarsProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    score: scoreToPercent(item[scoreKey]),
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 20, left: 24, bottom: 0 }}
        >
          <CartesianGrid stroke="#163121" strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8aa095", fontSize: 12 }}
          />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#d8ffe1", fontSize: 12 }}
            width={112}
          />
          <Tooltip
            cursor={{ fill: "rgba(57, 255, 20, 0.08)" }}
            contentStyle={{
              background: "#07110b",
              border: "1px solid #163121",
              borderRadius: 6,
              color: "#eafff0",
            }}
            formatter={(value) => [`${value}`, labels[scoreKey]]}
          />
          <Bar dataKey="score" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

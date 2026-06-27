import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyMetric } from "../../types/analytics";
import { compactMonth, formatNumber } from "../../utils/format";

interface MonthlyActivityChartProps {
  data: MonthlyMetric[];
}

export default function MonthlyActivityChart({
  data,
}: MonthlyActivityChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: compactMonth(item.month),
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="participantsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#39ff14" stopOpacity={0.38} />
              <stop offset="95%" stopColor="#39ff14" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#163121" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8aa095", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8aa095", fontSize: 12 }}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "#07110b",
              border: "1px solid #163121",
              borderRadius: 6,
              color: "#eafff0",
            }}
            formatter={(value, name) => [
              formatNumber(Number(value)),
              String(name),
            ]}
          />
          <Area
            type="monotone"
            dataKey="participants"
            name="Participants"
            stroke="#39ff14"
            strokeWidth={2}
            fill="url(#participantsFill)"
          />
          <Line
            type="monotone"
            dataKey="referrals"
            name="Referrals"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={{ r: 3, fill: "#22d3ee", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

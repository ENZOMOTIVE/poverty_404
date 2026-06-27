import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { CommuneMetric } from "../../types/analytics";
import { formatNumber } from "../../utils/format";

interface ReferralScatterChartProps {
  data: CommuneMetric[];
}

export default function ReferralScatterChart({
  data,
}: ReferralScatterChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 18, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#163121" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="participants"
            name="Participants"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8aa095", fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="referrals"
            name="Referrals"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8aa095", fontSize: 12 }}
            width={40}
          />
          <ZAxis
            type="number"
            dataKey="followupPriorityScore"
            range={[70, 360]}
            name="Priority"
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;

              const item = payload[0].payload as CommuneMetric;

              return (
                <div className="rounded-md border border-grid bg-panel p-3 text-xs shadow-neon-panel">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="mt-2 text-ash">
                    {formatNumber(item.participants)} participants
                  </p>
                  <p className="text-ash">{item.referrals} referrals</p>
                  <p className="text-neon">
                    Priority {Math.round(item.followupPriorityScore * 100)}
                  </p>
                </div>
              );
            }}
          />
          <Scatter data={data} fill="#39ff14" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SiteMetric } from "../../types/analytics";
import { scoreToPercent } from "../../utils/format";

interface RiskRadarChartProps {
  data: SiteMetric[];
}

export default function RiskRadarChart({ data }: RiskRadarChartProps) {
  const chartData = data.map((item) => ({
    site: item.name,
    risk: scoreToPercent(item.riskIntensityScore),
    referrals: scoreToPercent(item.referralScore),
    outreach: scoreToPercent(item.outreachLoadScore),
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#163121" />
          <PolarAngleAxis
            dataKey="site"
            tick={{ fill: "#d8ffe1", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "#07110b",
              border: "1px solid #163121",
              borderRadius: 6,
              color: "#eafff0",
            }}
          />
          <Radar
            dataKey="risk"
            name="Risk"
            stroke="#ff4d6d"
            fill="#ff4d6d"
            fillOpacity={0.18}
          />
          <Radar
            dataKey="outreach"
            name="Outreach"
            stroke="#39ff14"
            fill="#39ff14"
            fillOpacity={0.12}
          />
          <Radar
            dataKey="referrals"
            name="Referral"
            stroke="#22d3ee"
            fill="#22d3ee"
            fillOpacity={0.1}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

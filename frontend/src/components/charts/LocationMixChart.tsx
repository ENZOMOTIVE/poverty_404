import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { LocationMix } from "../../types/analytics";

interface LocationMixChartProps {
  data: LocationMix[];
}

const colors = ["#39ff14", "#22d3ee", "#f8cc45", "#ff4d6d", "#a7f3d0", "#8aa095"];

export default function LocationMixChart({ data }: LocationMixChartProps) {
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={96}
              paddingAngle={2}
              stroke="#020403"
              strokeWidth={3}
            >
              {data.map((item, index) => (
                <Cell
                  key={item.name}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#07110b",
                border: "1px solid #163121",
                borderRadius: 6,
                color: "#eafff0",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="truncate text-sm text-ash">{item.name}</span>
            </div>
            <span className="font-mono text-sm text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

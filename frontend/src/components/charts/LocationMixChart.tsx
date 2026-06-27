import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { LocationMix } from "../../types/analytics";
import { formatNumber } from "../../utils/format";

interface LocationMixChartProps {
  data: LocationMix[];
}

const colors = ["#39ff14", "#22d3ee", "#f8cc45", "#ff4d6d", "#a7f3d0", "#8aa095"];

export default function LocationMixChart({ data }: LocationMixChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="relative mx-auto h-56 w-full max-w-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="46%"
              outerRadius="70%"
              paddingAngle={2}
              stroke="#020403"
              strokeWidth={2}
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
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div className="max-w-24">
            <p className="font-mono text-xl font-semibold text-white">
              {formatNumber(total)}
            </p>
            <p className="mt-1 text-[10px] uppercase text-muted">activities</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-grid/70 bg-ink-2 px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="min-w-0 truncate text-xs text-ash">
                {item.name}
              </span>
            </div>
            <span className="shrink-0 font-mono text-xs text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

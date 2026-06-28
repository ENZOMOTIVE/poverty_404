import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import type { WhatIfAreaForecast } from "../../types/analytics";

interface ForecastTrajectoryChartProps {
  areas: WhatIfAreaForecast[];
}

const lineColors = ["#39ff14", "#22d3ee", "#f8cc45", "#ff4d6d"];

export default function ForecastTrajectoryChart({
  areas,
}: ForecastTrajectoryChartProps) {
  const visibleAreas = useMemo(() => areas.slice(0, 4), [areas]);
  const [activeIndex, setActiveIndex] = useState(0);
  const chartData = useMemo(() => {
    return (
      visibleAreas[0]?.trajectory.map((point, pointIndex) => {
        const isActive = pointIndex <= activeIndex;

        return visibleAreas.reduce<Record<string, string | number | null>>(
          (row, area, areaIndex) => ({
            ...row,
            [`area-${areaIndex}`]: isActive
              ? Math.round((area.trajectory[pointIndex]?.p50 ?? 0) * 100)
              : null,
          }),
          { label: point.label },
        );
      }) ?? []
    );
  }, [activeIndex, visibleAreas]);
  const safeIndex =
    chartData.length > 0 ? activeIndex % chartData.length : activeIndex;
  const activeLabel = chartData[safeIndex]?.label;
  const activeValues =
    visibleAreas[0]?.trajectory[safeIndex] &&
    visibleAreas.map((area) => ({
      areaId: area.areaId,
      areaName: area.areaName,
      value: Math.round((area.trajectory[safeIndex]?.p50 ?? 0) * 100),
    }));

  useEffect(() => {
    const length = visibleAreas[0]?.trajectory.length ?? 0;

    if (length <= 1) return;

    const id = window.setInterval(() => {
      setActiveIndex((index) => {
        return (index + 1) % length;
      });
    }, 1050);

    return () => window.clearInterval(id);
  }, [visibleAreas]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-neon/45 bg-neon/10 px-2 py-1 font-mono text-xs text-neon">
          {activeLabel ?? "M+1"}
        </span>
        {(activeValues || []).slice(0, 4).map((item, index) => (
          <span
            key={item.areaId}
            className="inline-flex items-center gap-2 rounded border border-grid bg-ink-2 px-2 py-1 text-xs text-muted"
          >
            <span
              className="size-2 rounded-full"
              style={{ background: lineColors[index] ?? "#39ff14" }}
            />
            {item.areaName}:{" "}
            <span className="font-mono text-white">{item.value}</span>
          </span>
        ))}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#163121" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8aa095", fontSize: 12 }}
              allowDuplicatedCategory={false}
            />
            <YAxis
              domain={[0, 100]}
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
              formatter={(value, name) => {
                const index = Number(String(name).replace("area-", ""));
                const areaName = visibleAreas[index]?.areaName ?? String(name);

                return [`${value}`, areaName];
              }}
            />
            {activeLabel && (
              <ReferenceLine
                x={activeLabel}
                stroke="#39ff14"
                strokeDasharray="4 4"
                strokeOpacity={0.72}
              />
            )}
            {visibleAreas.map((area, index) => (
              <Line
                key={area.areaId}
                type="monotone"
                dataKey={`area-${index}`}
                name={area.areaName}
                stroke={lineColors[index] ?? "#39ff14"}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs leading-5 text-muted">
        The cursor advances through the Monte Carlo horizon; each value is the
        current P50 trajectory point for that area.
      </p>
    </div>
  );
}

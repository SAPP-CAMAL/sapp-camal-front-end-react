"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { AnimalIncomeData } from "../domain/animal-income.types";

interface ChartModernProps {
  data: AnimalIncomeData[];
}

const COLORS = [
  "#0f766e", // Teal 700 (BOVINO)
  "#14b8a6", // Teal 500 (PORCINO)
  "#f59e0b", // Amber 500 (OVINO/CAPRINO)
  "#ef4444", // Red (Fallback)
  "#8b5cf6", // Violet (Fallback)
  "#ec4899", // Pink (Fallback)
];

export function ChartModern({ data }: ChartModernProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data.map((item) => ({
    name: item.species,
    value: item.quantity,
    percentage: item.percentage,
  }));

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold text-lg mb-2">{payload[0].name}</p>
          <p className="text-sky-400">
            Cantidad: <span className="font-bold">{payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-primary">
            Porcentaje: <span className="font-bold">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-bold text-sm drop-shadow-lg"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  if (!mounted || !data || data.length === 0) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] min-h-[300px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-4 sm:p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] min-h-[300px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-4 sm:p-6">
      <ResponsiveContainer width="100%" height="100%" debounce={1}>
        <PieChart>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={150}
            innerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#gradient-${index % COLORS.length})`}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={activeIndex === index ? 4 : 2}
                style={{
                  filter: activeIndex === index ? "brightness(1.2)" : "brightness(1)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              paddingTop: "20px",
            }}
            formatter={(value, entry: any) => (
              <span className="text-white font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

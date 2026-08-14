import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PieChartProps {
  data?: { name: string; value: number; color: string }[];
}

export const PieChartComponent: React.FC<PieChartProps> = ({ data }) => {
  const defaultData = data || [
    { name: "Technical Mastery", value: 40, color: "#6366f1" },
    { name: "Behavioral & Culture", value: 30, color: "#10b981" },
    { name: "Problem Solving", value: 20, color: "#f59e0b" },
    { name: "System Design", value: 10, color: "#ec4899" },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={defaultData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {defaultData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "0.75rem",
              color: "#f8fafc",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            formatter={(value) => <span className="text-slate-300 dark:text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

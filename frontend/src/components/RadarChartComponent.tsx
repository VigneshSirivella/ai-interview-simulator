import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { RadarMetrics } from "../types";

interface RadarChartProps {
  metrics?: RadarMetrics;
}

export const RadarChartComponent: React.FC<RadarChartProps> = ({ metrics }) => {
  const data = [
    { subject: "Technical", value: metrics?.technical || 80, fullMark: 100 },
    { subject: "Communication", value: metrics?.communication || 80, fullMark: 100 },
    { subject: "Problem Solving", value: metrics?.problemSolving || 80, fullMark: 100 },
    { subject: "Confidence", value: metrics?.confidence || 80, fullMark: 100 },
    { subject: "System/Culture", value: metrics?.systemDesignCulture || 80, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
          <Radar
            name="Skill Competency"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "0.75rem",
              color: "#f8fafc",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

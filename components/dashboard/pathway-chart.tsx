"use client";

import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CareerThread, PathwayCard } from "@/lib/types";

export function PathwayChart({
  threads,
  pathways,
}: {
  threads: CareerThread[];
  pathways: PathwayCard[];
}) {
  const radarData = threads.map((t) => ({
    thread: t.name.replace(" Thread", ""),
    score: t.score,
    fullMark: 100,
  }));

  const barData = pathways.map((p) => ({
    name: p.name.replace(" Path", ""),
    score: p.score,
    color: p.color,
  }));

  // Comparison data: pathway scores across different dimensions
  const comparisonDimensions = [
    "Salary Potential",
    "Growth Speed",
    "Stability",
    "Flexibility",
    "Impact",
  ];

  const comparisonData = comparisonDimensions.map((dim) => {
    const row: Record<string, string | number> = { dimension: dim };
    pathways.forEach((p) => {
      let val = p.score;
      if (dim === "Salary Potential") {
        val =
          p.id === "high-salary"
            ? 92
            : p.id === "stable-growth"
            ? 70
            : p.id === "leadership"
            ? 85
            : p.id === "startup-builder"
            ? 65
            : 75;
      } else if (dim === "Growth Speed") {
        val =
          p.id === "startup-builder"
            ? 90
            : p.id === "high-salary"
            ? 82
            : p.id === "skill-pivot"
            ? 78
            : p.id === "leadership"
            ? 60
            : 65;
      } else if (dim === "Stability") {
        val =
          p.id === "stable-growth"
            ? 92
            : p.id === "leadership"
            ? 80
            : p.id === "high-salary"
            ? 65
            : p.id === "skill-pivot"
            ? 55
            : 35;
      } else if (dim === "Flexibility") {
        val =
          p.id === "startup-builder"
            ? 88
            : p.id === "skill-pivot"
            ? 82
            : p.id === "stable-growth"
            ? 60
            : p.id === "high-salary"
            ? 55
            : 50;
      } else {
        val =
          p.id === "startup-builder"
            ? 85
            : p.id === "skill-pivot"
            ? 80
            : p.id === "leadership"
            ? 82
            : p.id === "stable-growth"
            ? 65
            : 70;
      }
      row[p.name.replace(" Path", "")] = val;
    });
    return row;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
          Visual Comparison
        </h2>
        <p className="text-sm text-navy-500 mt-1">
          Compare your threads and pathways at a glance
        </p>
      </div>

      <Tabs defaultValue="radar" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="radar">Thread Radar</TabsTrigger>
          <TabsTrigger value="pathways">Pathway Scores</TabsTrigger>
          <TabsTrigger value="comparison">Dimension Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="radar">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Career Thread Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#d9e0f0" />
                    <PolarAngleAxis
                      dataKey="thread"
                      tick={{ fill: "#273c6c", fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "#8da2d2", fontSize: 10 }}
                    />
                    <Radar
                      name="Your Profile"
                      dataKey="score"
                      stroke="#4164b4"
                      fill="#4164b4"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pathways">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Pathway Match Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f3f9" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: "#8da2d2", fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fill: "#273c6c", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #d9e0f0",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={28}>
                      {barData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Pathway Dimension Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f3f9" />
                    <XAxis
                      dataKey="dimension"
                      tick={{ fill: "#273c6c", fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#8da2d2", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #d9e0f0",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                    {pathways.map((p) => (
                      <Bar
                        key={p.id}
                        dataKey={p.name.replace(" Path", "")}
                        fill={p.color}
                        radius={[4, 4, 0, 0]}
                        barSize={12}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

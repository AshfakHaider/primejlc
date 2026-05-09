"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, humanize } from "@/lib/utils";

const palette = ["#e11d48", "#0f766e", "#f59e0b", "#2563eb", "#7c3aed"];

export function DashboardCharts({
  intakeData,
  financeData,
  pipelineData
}: {
  intakeData: { name: string; students: number }[];
  financeData: { month: string; income: number; expenses: number }[];
  pipelineData: { stage: string; count: number }[];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>Monthly financial movement and profit visibility.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financeData} margin={{ left: 0, right: 10 }}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="income" stroke="#0f766e" fill="url(#income)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#e11d48" fill="url(#expenses)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intake Mix</CardTitle>
          <CardDescription>Student distribution by target intake.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={intakeData} dataKey="students" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={4}>
                {intakeData.map((entry, index) => (
                  <Cell key={entry.name} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, _name, entry) => [`${value} students`, entry.payload.name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            {intakeData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                {item.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Admission Pipeline</CardTitle>
          <CardDescription>Lead to Japan flight readiness across the active student base.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineData} margin={{ bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} tickFormatter={humanize} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={(label) => humanize(String(label))} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

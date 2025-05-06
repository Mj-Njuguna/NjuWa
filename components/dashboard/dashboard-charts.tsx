"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";

interface ChartData {
  monthlyLoans: Array<{
    name: string;
    loans: number;
  }>;
  loanDurations: Array<{
    name: string;
    value: number;
  }>;
  repaymentTrends: {
    daily: Array<{
      name: string;
      amount: number;
    }>;
    weekly: Array<{
      name: string;
      amount: number;
    }>;
    monthly: Array<{
      name: string;
      amount: number;
    }>;
  };
  loanOfficerDistribution: Array<{
    name: string;
    value: number;
  }>;
}

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const RADIAN = Math.PI / 180;

// Custom label for the pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: LabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Format currency in Kenyan Shillings
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function DashboardCharts() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repaymentPeriod, setRepaymentPeriod] = useState('daily');

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);
        console.log('Fetching chart data...');
        const response = await fetch('/api/dashboard/charts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        
        const data = await response.json();
        console.log('Chart data received:', data);
        setChartData(data);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, []);

  // If loading, show skeleton UI
  if (loading) {
    console.log('Chart component is loading...');
    return (
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className={`col-span-1 ${i > 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // If error, show error message
  if (error) {
    console.log('Chart error:', error);
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 mb-8">
        {error}
      </div>
    );
  }

  // If no data, show empty state
  if (!chartData) {
    console.log('No chart data available');
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-blue-600 dark:text-blue-400 mb-8">
        No chart data available. Start by creating loan records.
      </div>
    );
  }

  console.log('Rendering charts with data:', chartData);

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-8">
      {/* Bar Chart: Number of loans disbursed per month */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Loans Disbursed</CardTitle>
          <CardDescription>Number of loans disbursed per month</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.monthlyLoans}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 25,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value).replace('KES', '')} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Bar
                dataKey="loans"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart: Distribution of loan durations */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Loan Durations</CardTitle>
          <CardDescription>Distribution of loan terms</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.loanDurations}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.loanDurations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend layout="vertical" verticalAlign="middle" align="right" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Doughnut Chart: Loan officer distribution */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Loan Officer Distribution</CardTitle>
          <CardDescription>Loans managed by each officer</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.loanOfficerDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.loanOfficerDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend layout="vertical" verticalAlign="middle" align="right" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Line Chart: Daily repayments trend */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <Tabs defaultValue="daily" onValueChange={setRepaymentPeriod}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Repayments Trend</CardTitle>
                <CardDescription>Repayment trends over time</CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="daily" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.repaymentTrends.daily}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value).replace('KES', '')} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }} 
                    formatter={(value) => [formatCurrency(value as number), 'Amount']}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="weekly" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.repaymentTrends.weekly}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value).replace('KES', '')} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [formatCurrency(value as number), 'Amount']}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="monthly" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.repaymentTrends.monthly}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value).replace('KES', '')} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [formatCurrency(value as number), 'Amount']}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
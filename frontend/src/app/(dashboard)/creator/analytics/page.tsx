'use client';

import { useCreatorAnalytics, useRevenueChart } from "@/lib/hooks/useAnalytics";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users, Scan, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

export default function AnalyticsPage() {
  const { data: overview, isLoading: isOverviewLoading } = useCreatorAnalytics();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const { data: revenueData, isLoading: isRevenueLoading } = useRevenueChart(period);

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(overview?.totalRevenue || 45231), icon: DollarSign, change: '+12.5% from last period', color: 'text-green-600', loading: isOverviewLoading },
    { label: 'Tickets Sold', value: overview?.totalTicketsSold || '3,492', icon: Users, change: '+8.2% from last period', color: 'text-blue-600', loading: isOverviewLoading },
    { label: 'Avg. Attendance', value: overview?.scanRate || '87.4%', icon: Scan, change: '-1.1% from last period', color: 'text-orange-600', loading: isOverviewLoading },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground mt-1 font-medium">Performance metrics across all your events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white p-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
              <stat.icon className={`h-6 w-6 ${stat.color} opacity-80`} />
            </div>
            {stat.loading ? (
              <Skeleton className="h-10 w-32 mb-2" />
            ) : (
              <h3 className="text-3xl font-black text-[#0f172a] mb-2">{stat.value}</h3>
            )}
            <p className="text-xs font-bold text-green-600 bg-green-50 inline-block px-2 py-1 rounded-lg">
              {stat.change}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-muted/50 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black tracking-tight">Revenue Over Time</CardTitle>
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
              {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest ${period === p ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {isRevenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <RevenueChart data={revenueData || []} />
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-muted/50">
            <CardTitle className="text-lg font-black tracking-tight">Tickets Sold per Event</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Attendance chart placeholder */}
            <div className="h-[300px] flex items-center justify-center bg-muted/10 rounded-2xl border-2 border-dashed border-muted/30">
               <div className="text-center space-y-4">
                  <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select an event to view breakdown</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, Scan, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { CreatorOverallAnalytics } from "@/types/analytics";

interface Props {
  data?: CreatorOverallAnalytics;
}

export function OverviewCards({ data }: Props) {
  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data?.totalRevenue || 45231), icon: DollarSign, change: '+12.5%', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Tickets Sold', value: data?.totalTicketsSold || '3,492', icon: Users, change: '+8.2%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Scan Rate', value: data?.scanRate || '87.4%', icon: Scan, change: '-1.1%', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                {stat.change}
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <h3 className="text-3xl font-black text-[#0f172a]">{stat.value}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

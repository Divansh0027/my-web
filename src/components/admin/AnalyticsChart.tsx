import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useState, useEffect } from 'react';

export default function AnalyticsChart({ data, type, approvedListingsCount = 0, pendingApprovalsCount = 0, enquiriesCount = 0, usersCount = 0 }: { data?: Record<string, string | number>[]; type: string; approvedListingsCount?: number; pendingApprovalsCount?: number; enquiriesCount?: number; usersCount?: number; }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-surface-container animate-pulse rounded-xl" />;

  if (type === 'bar') {
    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={[
            { name: 'Approved', count: approvedListingsCount, fill: 'var(--success-green)' },
            { name: 'Pending', count: pendingApprovalsCount, fill: 'var(--gold-accent)' },
            { name: 'Enquiries', count: enquiriesCount, fill: '#ef4444' },
            { name: 'Users', count: usersCount, fill: '#3b82f6' }
          ]} margin={{ top: 10, right: 30, left: -20, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" vertical={true} />
            <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={data || [
          { name: 'Mon', views: 400, properties: 240 },
          { name: 'Tue', views: 300, properties: 139 },
          { name: 'Wed', views: 200, properties: 980 },
          { name: 'Thu', views: 278, properties: 390 },
          { name: 'Fri', views: 189, properties: 480 },
          { name: 'Sat', views: 239, properties: 380 },
          { name: 'Sun', views: 349, properties: 430 },
        ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--gold-accent)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--gold-accent)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />
          <Area type="monotone" dataKey="views" stroke="var(--gold-accent)" fillOpacity={1} fill="url(#colorViews)" />
          <Area type="monotone" dataKey="properties" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProps)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

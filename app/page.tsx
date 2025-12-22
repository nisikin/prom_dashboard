"use client";

import React, { useState, useEffect } from 'react';
import { Layout, Badge, Tag } from 'antd';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Activity, 
  Server, 
  Cpu, 
  MemoryStick, 
  Network, 
  LayoutDashboard, 
  AlertTriangle,
  Menu as MenuIcon,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// 样式常量
const COLORS = {
  bg: "#020617",
  card: "#111827",
  border: "#1f2937",
  primary: "#6366f1",
  secondary: "#ec4899",
  success: "#10b981",
  axis: "#6b7280"
};

export default function EnterpriseMonitor() {
  const [collapsed, setCollapsed] = useState(false);
  const [history, setHistory] = useState<any>({ cpu: [], mem: [], net: [] });

  // 模拟数据流
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
      const getVal = (base: number, v: number) => Math.floor(base + Math.random() * v);
      setHistory((prev: any) => {
        const update = (arr: any[], val: number) => [...arr, { time: now, value: val }].slice(-15);
        return {
          cpu: update(prev.cpu, getVal(35, 25)),
          mem: update(prev.mem, getVal(58, 4)),
          net: update(prev.net, getVal(120, 380))
        };
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // 图表组件 (带坐标轴和单位)
  const MetricChart = ({ title, data, color, unit, domain = ['auto', 'auto'] }: any) => (
    <div className="rounded-xl border border-gray-800 bg-[#111827] flex flex-col shadow-xl overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 rounded-full" style={{ background: color }}></div>
          <span className="text-sm font-semibold text-gray-200 tracking-wide uppercase">{title}</span>
        </div>
        <div className="flex items-baseline gap-1 text-white">
          <span className="text-2xl font-mono font-bold">{data.length > 0 ? data[data.length - 1].value : 0}</span>
          <span className="text-xs text-gray-500 font-medium">{unit}</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 pt-4 w-full px-2 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="100%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.2} />
            <XAxis dataKey="time" tick={{ fill: COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={35} domain={domain} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: number) => [`${value} ${unit}`, title]}
            />
            <Area type="monotone" dataKey="value" stroke={color} fill={`url(#grad-${title})`} strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#020617] text-white overflow-hidden font-sans">
      <style jsx global>{`body, html { margin: 0; padding: 0; background-color: #020617; }`}</style>

      {/* --- 侧边栏 (Sidebar) --- */}
      <div className={`flex flex-col border-r border-gray-800 bg-[#0b0f19] transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        
        {/* Logo 区域：现在只有 Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-800">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <Activity className="text-indigo-500 shrink-0" size={24} />
            {!collapsed && <span className="text-lg font-bold tracking-wider text-white">NET.SCOPE</span>}
          </div>
        </div>

        {/* 导航区域：折叠按钮现在在 Dashboard 上方 */}
        <div className="flex-1 py-4 space-y-1 px-3">
          
          {/* 新增：位于 Dashboard 上方的折叠按钮 */}
          <div className={`flex items-center mb-4 ${collapsed ? 'justify-center' : 'px-3'}`}>
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all border border-transparent hover:border-gray-700 shadow-sm"
            >
              {collapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2 font-medium text-xs uppercase tracking-tighter"><MenuIcon size={20} /></div>}
            </button>
          </div>

          {/* 导航项 */}
          <div className="flex items-center px-3 py-2.5 bg-indigo-600/10 text-indigo-400 rounded-lg cursor-pointer border border-indigo-500/20 mb-2">
            <LayoutDashboard size={20} className="shrink-0" />
            {!collapsed && <span className="ml-3 text-sm font-semibold uppercase tracking-wide">Dashboard</span>}
          </div>
          
          <div className="flex items-center px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
            <Server size={20} className="shrink-0" />
            {!collapsed && <span className="ml-3 text-sm font-semibold uppercase tracking-wide">Nodes</span>}
          </div>

           <div className="flex items-center px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
            <AlertTriangle size={20} className="shrink-0" />
            {!collapsed && <span className="ml-3 text-sm font-semibold uppercase tracking-wide">Alerts</span>}
          </div>
        </div>
      </div>

      {/* --- 主内容区 --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 bg-[#0b0f19]/80 backdrop-blur-md flex items-center justify-between px-6">
          <div className="text-gray-400 flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
            <Search size={14} />
            <span className="text-xs">Search metrics...</span>
          </div>
          <div className="flex items-center gap-4">
            <Tag color="#1f2937" className="text-green-400 border-green-900 bg-green-900/20 px-2 py-0.5 text-xs font-medium">● ONLINE</Tag>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">AD</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {/* KPI 概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <KPICard title="Active Nodes" value="8" unit="Nodes" icon={Server} color={COLORS.primary} />
            <KPICard title="Avg Load" value="42" unit="%" icon={Cpu} color={COLORS.secondary} />
            <KPICard title="Mem Usage" value="64" unit="GB" icon={MemoryStick} color="#f59e0b" />
            <KPICard title="Net I/O" value="1.2" unit="Gbps" icon={Network} color={COLORS.success} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 h-[380px]">
            <div className="lg:col-span-2 h-full">
              <MetricChart title="Cluster CPU Usage" data={history.cpu} color={COLORS.primary} unit="%" domain={[0, 100]} />
            </div>
            <div className="flex flex-col gap-5 h-full">
              <div className="flex-1 min-h-0"><MetricChart title="Memory (RAM)" data={history.mem} color={COLORS.secondary} unit="GB" /></div>
              <div className="flex-1 min-h-0"><MetricChart title="Network Out" data={history.net} color={COLORS.success} unit="Mbps" /></div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-[#111827] overflow-hidden shadow-lg mb-6 text-white">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between"><h3 className="text-sm font-bold uppercase tracking-wide">Recent Events</h3><Badge count={3} color="#ef4444" size="small" /></div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-900/50 text-gray-500 text-xs uppercase font-semibold">
                  <tr><th className="px-6 py-3 border-b border-gray-800">Time</th><th className="px-6 py-3 border-b border-gray-800">Status</th><th className="px-6 py-3 border-b border-gray-800">Source</th><th className="px-6 py-3 border-b border-gray-800">Message</th></tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-800">
                  {[1, 2, 3].map((_, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-3 font-mono text-gray-500 group-hover:text-gray-300">2024-12-20 10:45:{12 + i}</td>
                      <td className="px-6 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">CRITICAL</span></td>
                      <td className="px-6 py-3 text-gray-300">node-exporter-{i}</td>
                      <td className="px-6 py-3 text-gray-400">Memory usage exceeded threshold (9{i}%)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// KPI 卡片组件
const KPICard = ({ title, value, unit, icon: Icon, color }: any) => (
  <div className="flex-1 p-5 rounded-xl border border-gray-800 bg-[#111827] flex items-center justify-between shadow-lg">
    <div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-baseline gap-2 text-white">
        <span className="text-4xl font-bold font-sans">{value}</span>
        <span className="text-sm text-gray-500 font-medium">{unit}</span>
      </div>
    </div>
    <div className="p-3 rounded-lg bg-opacity-10" style={{ backgroundColor: `${color}20` }}><Icon size={24} style={{ color: color }} /></div>
  </div>
);
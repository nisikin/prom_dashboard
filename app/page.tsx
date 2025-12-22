"use client";

import React, { useState, useEffect } from 'react';
import { Badge, Tag, Spin } from 'antd';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Activity, Server, Cpu, MemoryStick, Network, LayoutDashboard, 
  AlertTriangle, Menu as MenuIcon, Search, ChevronRight 
} from 'lucide-react';

// 配置常量
const SIDEBAR_WIDTH = { expand: "w-72", collapse: "w-16" }; // 宽度略微增加以适配大字体
const COLORS = { primary: "#6366f1", secondary: "#ec4899", axis: "#9ca3af" };

interface HistoryPoint {
  time: string;
  cpu: number;
  mem: number;
}

export default function AdvancedMonitor() {
  const [collapsed, setCollapsed] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const PROMETHEUS_BASE = "http://10005480di8ni.vicp.fun";

  const fetchData = async () => {
    try {
      const targetRes = await fetch(`${PROMETHEUS_BASE}/api/v1/targets`);
      const targetData = await targetRes.json();
      const targetIp = "10.168.1.131:9100";
      const cpuQuery = `1 - avg(irate(node_cpu_seconds_total{instance="${targetIp}",mode="idle"}[5m]))`;
      const memQuery = `(node_memory_MemTotal_bytes{instance="${targetIp}"} - node_memory_MemAvailable_bytes{instance="${targetIp}"}) / node_memory_MemTotal_bytes{instance="${targetIp}"} * 100`;
      
      const [cpuRes, memRes] = await Promise.all([
        fetch(`${PROMETHEUS_BASE}/api/v1/query?query=${encodeURIComponent(cpuQuery)}`),
        fetch(`${PROMETHEUS_BASE}/api/v1/query?query=${encodeURIComponent(memQuery)}`)
      ]);

      const cpuJson = await cpuRes.json();
      const memJson = await memRes.json();

      if (targetData.status === "success") {
        const rawTargets = targetData.data.activeTargets || [];
        setNodes(rawTargets.map((t: any) => ({
          ...t,
          displayIp: t.instance || t.labels?.instance || "未知IP"
        })).filter((t: any) => !t.displayIp.includes("127.0.0.1")));
      }

      const currentCpu = cpuJson.data?.result?.[0]?.value?.[1];
      const currentMem = memJson.data?.result?.[0]?.value?.[1];

      if (currentCpu !== undefined && currentMem !== undefined) {
        const cpuVal = parseFloat(currentCpu) * 100;
        const memVal = parseFloat(currentMem);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        setHistory(prev => {
          const newHistory = [...prev, { 
            time: now, 
            cpu: Number(cpuVal.toFixed(2)), 
            mem: Number(memVal.toFixed(2)) 
          }];
          return newHistory.slice(-15);
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("数据抓取异常:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, []);

  // --- 内部组件：封装图表适配器 ---
  const MetricChart = ({ title, dataKey, color, unit, domain }: any) => (
    <div className="rounded-xl border border-gray-800 bg-[#111827] flex flex-col shadow-xl overflow-hidden h-full">
      <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 rounded-full" style={{ background: color }}></div>
          <span className="text-base font-bold text-gray-200 uppercase tracking-widest">{title}</span>
        </div>
        <div className="flex items-baseline gap-2 text-white">
          <span className="text-4xl font-mono font-bold">
            {history.length > 0 ? (history[history.length - 1] as any)[dataKey] : '--'}
          </span>
          <span className="text-sm text-gray-400 font-medium">{unit}</span>
        </div>
      </div>
      <div className="flex-1 pt-6 px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="100%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.2} />
            <XAxis dataKey="time" tick={{ fill: COLORS.axis, fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: COLORS.axis, fontSize: 12 }} tickLine={false} axisLine={false} width={40} domain={domain} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '10px', fontSize: '14px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad-${dataKey})`} strokeWidth={3} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#020617] text-white overflow-hidden font-sans">
      {/* 侧边栏 */}
      <div className={`flex flex-col border-r border-gray-800 bg-[#0b0f19] transition-all duration-300 z-20 ${collapsed ? SIDEBAR_WIDTH.collapse : SIDEBAR_WIDTH.expand}`}>
        <div className="h-20 flex items-center px-6 border-b border-gray-800 overflow-hidden">
          <div className={`flex items-center gap-3 ${collapsed ? 'w-full justify-center' : ''}`}>
            <Activity className="text-indigo-500 shrink-0" size={32} />
            {!collapsed && <span className="text-xl font-black tracking-tighter uppercase">Net.Scope</span>}
          </div>
        </div>

        <div className={`flex-1 py-6 space-y-3 ${collapsed ? 'px-0' : 'px-4'}`}>
          <div className={`flex items-center mb-8 w-full ${collapsed ? 'justify-center' : 'px-4'}`}>
            <button onClick={() => setCollapsed(!collapsed)} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all border border-gray-800/50">
              {collapsed ? <ChevronRight size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>

          <div className={`flex items-center cursor-pointer transition-all mx-auto ${collapsed ? 'w-12 h-12 justify-center rounded-2xl bg-indigo-600/10 text-indigo-400' : 'px-4 py-3.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'}`}>
            <LayoutDashboard size={24} className="shrink-0" />
            {!collapsed && <span className="ml-4 text-base font-bold uppercase tracking-wide">Dashboard</span>}
          </div>
          
          <div className={`flex items-center cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800 transition-all mx-auto ${collapsed ? 'w-12 h-12 justify-center rounded-2xl' : 'px-4 py-3.5 rounded-xl'}`}>
            <Server size={24} className="shrink-0" />
            {!collapsed && <span className="ml-4 text-base font-bold uppercase tracking-wide">Nodes List</span>}
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-gray-800 bg-[#0b0f19]/80 backdrop-blur-md flex items-center justify-between px-8">
          <div className="text-gray-400 flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-full border border-gray-800 text-sm">
            <Search size={18} /> <span>Active Nodes: {nodes.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <Tag color="#064e3b" className="text-green-400 border-green-900 px-3 py-1 text-xs font-bold uppercase tracking-tighter">● Online</Tag>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {loading && history.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center flex-col gap-6">
              <Spin size="large" />
              <p className="text-gray-400 text-sm uppercase tracking-[0.2em]">Synchronizing Prometheus Data...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 h-[450px]">
                <MetricChart title="CPU Utilization" dataKey="cpu" color="#6366f1" unit="%" domain={[0, 100]} />
                <MetricChart title="Memory Usage" dataKey="mem" color="#ec4899" unit="%" domain={[0, 100]} />
              </div>

              <div className="rounded-2xl border border-gray-800 bg-[#111827] overflow-hidden shadow-2xl">
                 <div className="px-8 py-6 border-b border-gray-800 flex justify-between bg-gray-900/30">
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-400">Target Environment</h3>
                    <Badge count={nodes.length} color="#6366f1" style={{ fontSize: '14px', height: '24px', minWidth: '24px', lineHeight: '24px' }} />
                 </div>
                 <table className="w-full text-left">
                    <thead className="bg-gray-900/50 text-xs text-gray-500 uppercase font-black tracking-widest">
                       <tr>
                         <th className="px-8 py-5 border-b border-gray-800">Endpoint</th>
                         <th className="px-8 py-5 border-b border-gray-800 text-center">Health</th>
                         <th className="px-8 py-5 border-b border-gray-800">Internal Labels</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-800">
                       {nodes.map((node, i) => (
                         <tr key={i} className="hover:bg-indigo-500/5 transition-colors group">
                           <td className="px-8 py-5 font-mono text-indigo-400 text-base group-hover:text-indigo-300">{node.displayIp}</td>
                           <td className="px-8 py-5 text-center">
                             <span className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-tighter ${node.health === 'up' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                               {node.health}
                             </span>
                           </td>
                           <td className="px-8 py-5 text-gray-500 text-xs truncate max-w-[300px] font-mono">
                             {JSON.stringify(node.labels)}
                           </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
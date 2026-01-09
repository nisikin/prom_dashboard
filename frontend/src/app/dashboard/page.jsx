"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ChartExample } from "@/components/chart-example"
import { PromAISearch } from "@/components/prom-ai-search"
import { CustomChartCard } from "@/components/custom-chart-card"
import { NodeTableCard } from "@/components/node-table-card"
import { QueryCard } from "@/components/query-card"



export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)"
        }
      }>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <PromAISearch />
              <div
                className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-2">
                <NodeTableCard />
                <QueryCard query="node_memory_MemAvailable_bytes" title="Available Memory" upperBound={8 * 1024 * 1024 * 1024} y_func={(value) => { return String((value / 1024 / 1024 / 1024).toFixed(2)) + "GB" }} />
              </div>
              <div className="px-4 lg:px-6">
                <ChartExample />
              </div>
              <div
                className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                <CustomChartCard query="node_memory_MemAvailable_bytes" title="Available Memory" upperBound={8 * 1024 * 1024 * 1024} y_func={(value) => { return String((value / 1024 / 1024 / 1024).toFixed(0)) + "GB" }} />
                <CustomChartCard query="rate(node_disk_read_bytes_total[1m])" title="Disk Read" y_func={(value) => { return String((value).toFixed(0)) + "KB/s" }} />
                <CustomChartCard query='rate(node_network_receive_bytes_total{device="ens33"}[1m])' title="Bytes In(ens33)" y_func={(value) => { return String((value).toFixed(0)) + "KB/s" }} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

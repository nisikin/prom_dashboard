"use client"
import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { queryMetrics, queryMetricsRange, createChartConfig } from "@/lib/utils"
import { format } from "date-fns"

export function ChartExample() {
  const [chartData, setChartData] = React.useState([])
  const [timeStep, setTimeStep] = React.useState("10s");
  const [chartConfig, setChartConfig] = React.useState({})

  const fetchData = () => {
    const start = format(new Date(Date.now() - 30 * 60 * 1000), "yyyy-MM-dd HH:mm:ss")
    const end = format(new Date(), "yyyy-MM-dd HH:mm:ss")
    queryMetricsRange("/metric/average_cpu_usage_range", start, end, timeStep).then((data) => {
      try {
        for (let i = 0; i < data.length; i++) {
          data[i]["y"] = 100
        }
        setChartData(data)
      } catch (error) {
        console.error("Error processing chart data:", error);
      }
    })
  }

  React.useEffect(() => {
    const fetchChartConfig = async () => {
      var line = await queryMetrics("/metric/average_cpu_usage")
      const config = createChartConfig(line)
      setChartConfig(config)
    }
    fetchChartConfig()
    fetchData()

    const intervalId = setInterval(fetchData, 10000);   // Hot update every 10 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [])


  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Average CPU Usage</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Average CPU Usage(all cpu core) of each instance for the last 30 minutes
          </span>
          <span className="@[540px]/card:hidden">Last 30 minutes</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart data={chartData} accessibilityLayer >
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey="y"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value.toFixed(2)}%`}
            />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value * 1000)
                return format(date, "HH:mm:ss")
              }} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return ""
                  }}
                  indicator="dot" />
              } />
            {Object.entries(chartConfig).map(([key, series]) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={series.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

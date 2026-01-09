"use client"
import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardTitle,
    CardHeader,
    CardFooter,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { queryMetrics, queryMetricsRange, createChartConfig } from "@/lib/utils"
import { format } from "date-fns"
export function CustomChartCard({
    title = "",
    foot = "",
    query = "",
    upperBound = "*",
    lowerBound = 0,
    y_func = (value) => { return value }
}) {
    const [chartData, setChartData] = React.useState([])
    const [timeStep, setTimeStep] = React.useState("10s");
    const [chartConfig, setChartConfig] = React.useState({})

    const fetchData = () => {
        const start = format(new Date(Date.now() - 30 * 60 * 1000), "yyyy-MM-dd HH:mm:ss")
        const end = format(new Date(), "yyyy-MM-dd HH:mm:ss")
        queryMetricsRange("/custom/custom_query_range", start, end, timeStep + "&query=" + query).then((data) => {
            try {
                for (let i = 0; i < data.length; i++) {
                    if (lowerBound != 0 && i == 0) {
                        data[i]["y"] = lowerBound
                    } else {
                        if (upperBound != "*") {
                            data[i]["y"] = upperBound
                        }
                        else {
                            var max = 0
                            for (var key in data[i]) {
                                if (key == "time") {
                                    continue
                                }
                                if (data[i][key] > max) {
                                    max = data[i][key]
                                }
                            }
                            console.log(max)
                            data[i]["y"] = max
                        }
                    }
                }
                setChartData(data)
            } catch (error) {
                console.error("Error processing chart data:", error);
            }
        })
    }

    React.useEffect(() => {
        const fetchChartConfig = async () => {
            var line = await queryMetrics("/custom/custom_query?query=" + query)
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
                <CardTitle>{title}</CardTitle>
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
                            tickFormatter={(value) => {
                                return y_func(value)
                            }}
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
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {foot}
                </div>
            </CardFooter>
        </Card>
    )
}
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
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { queryMetrics, queryMetricsRange, createChartConfig } from "@/lib/utils"
import { format } from "date-fns"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
export function QueryCard({
}) {
    const [chartData, setChartData] = React.useState([])
    const [timeStep, setTimeStep] = React.useState("10s");
    const [chartConfig, setChartConfig] = React.useState({})
    const [inputQuery, setInputQuery] = React.useState("")
    const [timeRange, setTimeRange] = React.useState("30s")
    const [customStartTime, setCustomStartTime] = React.useState()
    const [customEndTime, setCustomEndTime] = React.useState(new Date())

    const timeRangeOptions = [
        { value: "30s", label: "30s", seconds: 30 },
        { value: "1m", label: "1m", seconds: 60 },
        { value: "5m", label: "5m", seconds: 300 },
        { value: "15m", label: "15m", seconds: 900 },
        { value: "30m", label: "30m", seconds: 1800 },
        { value: "1h", label: "1h", seconds: 3600 },
        { value: "custom", label: "Custom", seconds: 0 },
    ]

    const calculateTimeStep = (startTime, endTime) => {
        const diffSeconds = Math.floor((endTime - startTime) / 1000)
        if (diffSeconds <= 60) return "5s"
        if (diffSeconds <= 300) return "10s"
        if (diffSeconds <= 1800) return "30s"
        if (diffSeconds <= 3600) return "1m"
        if (diffSeconds <= 7200) return "2m"
        if (diffSeconds <= 14400) return "5m"
        if (diffSeconds <= 28800) return "10m"
        if (diffSeconds <= 86400) return "30m"
        return "1h"
    }

    React.useEffect(() => {
        const fetchChartConfig = async () => {
            var line = await queryMetrics("/metric/average_cpu_usage")
            const config = createChartConfig(line)
            setChartConfig(config)
        }
        fetchChartConfig()
    }, [])

    const fetchData = (currentQuery = inputQuery) => {
        let start, end
        let currentStep = timeStep

        if (timeRange === "custom" && customStartTime && customEndTime) {
            start = format(customStartTime, "yyyy-MM-dd HH:mm:ss")
            end = format(customEndTime, "yyyy-MM-dd HH:mm:ss")
            currentStep = calculateTimeStep(customStartTime, customEndTime)
        } else {
            const selectedRange = timeRangeOptions.find(opt => opt.value === timeRange)
            start = format(new Date(Date.now() - selectedRange.seconds * 1000), "yyyy-MM-dd HH:mm:ss")
            end = format(new Date(), "yyyy-MM-dd HH:mm:ss")
        }

        queryMetricsRange("/custom/custom_query_range", start, end, currentStep + "&query=" + currentQuery).then((data) => {
            try {
                setChartData(data)
            } catch (error) {
                console.error("Error processing chart data:", error);
            }
        })
    }

    const handleSearch = () => {
        fetchData(inputQuery)
    }

    React.useEffect(() => {
        if (inputQuery) {
            fetchData(inputQuery)
        }
    }, [timeRange, customStartTime, customEndTime])

    return (
        <Card className="@container/card">
            <CardHeader>
                <div className="flex gap-2 mb-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="time range" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeRangeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputGroup className="flex-1">
                        <InputGroupInput
                            placeholder="Enter PromQL query..."
                            value={inputQuery}
                            onChange={(e) => setInputQuery(e.target.value)}
                        />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton variant="secondary" onClick={handleSearch}>Search</InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
                {timeRange === "custom" && (
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {customStartTime ? format(customStartTime, "yyyy-MM-dd HH:mm") : "Start Time"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={customStartTime}
                                    onSelect={setCustomStartTime}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {customEndTime ? format(customEndTime, "yyyy-MM-dd HH:mm") : "End Time"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={customEndTime}
                                    onSelect={setCustomEndTime}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <LineChart data={chartData} accessibilityLayer >
                        <CartesianGrid vertical={false} />
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
    )
}
"use client"
import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { queryMetrics } from "@/lib/utils"


export const columns = [
  {
    accessorKey: "instance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Instance
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("instance")}</div>,
  },
  {
    accessorKey: "cpuUsage",
    header: () => <div className="text-right">CPU Usage</div>,
    cell: ({ row }) => {
      const cpuUsage = parseFloat(row.getValue("cpuUsage"))

      return <div className="text-right font-medium">{cpuUsage}%</div>
    },
  },
]

export function NodeTableCard() {
  const [data, setData] = React.useState([])
  const [sorting, setSorting] = React.useState([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5,
  })

  const data_len = (data) => {
    var res = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].instance == "--") {
        continue;
      }
      res++;
    }
    return res;
  }

  const fetchData = async () => {
    var d = []
    var line = await queryMetrics("/metric/average_cpu_usage")
    for (var key in line) {
      if (key === "time") {
        continue
      }
      d.push({
        id: key,
        instance: key,
        cpuUsage: line[key],
      })
    }
    if (d.length % 5 != 0) {
      var padding = 5 - d.length % 5
      for (var i = 0; i < padding; i++) {
        d.push({
          id: "padding" + i,
          instance: "--",
          cpuUsage: 0,
        })
      }
    }
    setData(d)
  }

  useEffect(() => {
    fetchData()

    const intervalId = setInterval(fetchData, 10000);   // Hot update every 10 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Alive Nodes</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {data_len(data)}
        </CardTitle>
      </CardHeader>
      <div className="px-5">
        <div className="w-full">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card >
  )
}

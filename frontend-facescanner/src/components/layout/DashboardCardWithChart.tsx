import React, { useState } from "react";
import { HeatMapChart } from "../dashboard/HeatMapChart";
import { PieChart } from "../dashboard/PieChart";
import { DashboardChartProps } from "../../types/chart";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardCardWithCharts({
    pieSeries,
    pieOptions,
    heatMapSeries,
    heatMapOptions,
  }: DashboardChartProps) {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 = back, 1 = next
  
    const charts = [
      {
        id: 0,
        title: "Pie Chart",
        component: (
          <PieChart
            options={pieOptions}
            series={pieSeries}
            width="100%"
            height="100%"
          />
        ),
      },
      {
        id: 1,
        title: "Heatmap",
        component: (
          <HeatMapChart
            options={heatMapOptions}
            series={heatMapSeries}
            width="100%"
            height="100%"
          />
        ),
      },
    ];

//   React.useEffect(() => {
//     fetch("https://feasible-dove-simply.ngrok-free.app/dashboard?", { headers: { "ngrok-skip-browser-warning": "true" } })
//       .then((res) => res.json())
//       .then((data: { data?: { hourly_attendance?: { date: string; hour: number; count: number; }[]; daily_attendance?: { date: string; count: number }[]; }}) => {
//         console.log("Data Is Here", data);
//         if (data?.data?.hourly_attendance) {
//           const groupedByDate: Record<string, number[]> = {};
//           data.data.hourly_attendance.forEach(({ date, hour, count }) => {
//             if (!groupedByDate[date]) {
//               groupedByDate[date] = Array(24).fill(0);
//             }
//             groupedByDate[date][hour] = count;
//           });
//           const formatted = Object.entries(groupedByDate).map(([date, hourlyCounts]) => ({
//             name: date,
//             data: hourlyCounts.map((count, hour) => ({
//               x: hour.toString(),
//               y: count,
//             })),
//           })) as {
//             name: string;
//             data: { x: string; y: number }[];
//           }[];
//           setheatMapOptions((prev) => ({ ...prev }));
//           setHeatMapSeries(formatted);
//         }
//         if (data?.data?.daily_attendance) {
//           const series = data.data.daily_attendance.map(item => item.count);
//           const labels = data.data.daily_attendance.map(item => item.date);
//           setPieSeries(series);
//           setPieOptions((prev) => ({ ...prev, labels: labels }));
//         }
//       })
//       .catch((err) => {
//         console.error("Fetch failed:", err);
//       });
//   }, [])

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev === 0 ? charts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev === charts.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card className="flex-1 h-[500px] rounded-xl shadow-lg border border-gray-200 bg-white overflow-hidden">
     <CardHeader className="flex flex-row justify-between items-center">
        <p className="text-lg font-semibold">{charts[index].title}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative h-96 overflow-hidden p-0 m-6 mt-0"> {/* Adjust height to fit charts */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={charts[index].id}
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute w-full h-full"
          >
            {charts[index].component}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

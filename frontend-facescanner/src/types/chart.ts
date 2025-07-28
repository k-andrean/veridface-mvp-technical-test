// types.ts
import { ApexOptions } from "apexcharts";

export interface DashboardChartProps {
  pieSeries: ApexNonAxisChartSeries;
  pieOptions: ApexOptions;
  heatMapSeries: ApexNonAxisChartSeries
  heatMapOptions: ApexOptions;
}

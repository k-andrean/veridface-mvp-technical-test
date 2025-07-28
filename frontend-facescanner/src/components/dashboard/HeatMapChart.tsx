
import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface HeatMapChartProps {
  options?: ApexCharts.ApexOptions;
  series?: ApexNonAxisChartSeries;
  width?: string | number;
  height?: string | number;
}

export const HeatMapChart: React.FC<HeatMapChartProps> = ({
  options,
  series,
  width,
  height,
}) => {
  if (series && series?.length === 0) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        Currently Have No Data
      </div>
    )
  }
  return (
    <ReactApexChart
      options={options}
      series={series}
      width={width}
      height={height}
      type="heatmap"
    />
  );
};

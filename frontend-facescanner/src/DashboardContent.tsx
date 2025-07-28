import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { ActivityLogItem } from './components/ui/ActivityLogItem';
import DashboardCardWithCharts from './components/layout/DashboardCardWithChart';
import { UserCheck, UserX, Clock, Users } from 'lucide-react';
import clsx from 'clsx';
import { venues } from './lib/utils';



function DashboardContent() {
  const [attendanceData, setAttendanceData] = React.useState({
    total_attendance_today: 0,
    total_absence_today: 0,
    total_late_today: 0,
    total_user: 0
  });
  const [selectedVenue, setSelectedVenue] = React.useState(venues[0]);
  const [activityLogs, setActivityLogs] = React.useState([]);
  const [pieSeries, setPieSeries] = React.useState<ApexNonAxisChartSeries>([]);
  const [pieOptions, setPieOptions] = React.useState<ApexCharts.ApexOptions>({ chart: { width: "100%" }, colors: ["#008FFB", "#FF4560", "#FEB019", "#00E396", "#775DD0"], stroke: { width: 1, colors: ["#fff"] }, labels: [], legend: { position: "bottom" } });
  const [heatMapSeries, setHeatMapSeries] = React.useState<ApexNonAxisChartSeries>([]);
  const [heatMapOptions, setHeatMapOptions] = React.useState<ApexCharts.ApexOptions>({ chart: { width: "100%" }, colors: ["#008FFB"], stroke: { width: 1, colors: ["#ccc"] } });

  const cardData = [
    {
      label: 'Attendance',
      icon: <UserCheck className="w-8 h-8 text-blue-500 mb-2" />,
      value: attendanceData.total_attendance_today || 0,
      color:'blue',
    },
    {
      label: 'Absence',
      icon: <UserX className="w-8 h-8 text-red-500 mb-2" />,
      value: attendanceData.total_absence_today || 0,
      color:'red'
    },
    {
      label: 'Late',
      icon: <Clock className="w-8 h-8 text-yellow-500 mb-2" />,
      value: attendanceData.total_late_today || 0,
      color: 'yellow'
    },
    {
      label: 'Total Users',
      icon: <Users className="w-8 h-8 text-green-500 mb-2" />,
      value: attendanceData.total_user || 0,
      color: 'green'
    },
  ];

  React.useEffect(() => {

    const url = `https://feasible-dove-simply.ngrok-free.app/dashboard?event=${encodeURIComponent(selectedVenue)}`;
    
    fetch(url, 
    {
      headers: { "ngrok-skip-browser-warning": "true" },
    }
    )
      .then((res) => res.json())
      .then((data) => {
        if(data?.data) {
          setAttendanceData(data?.data);
          const userRaw = data?.data; 
          const activityLogsData = userRaw?.latest_log?.map((item) => {
            return {
              timestamp: item.fields?.timestamp.split("T")[0],
              title: item.fields?.title
            }
          })

          console.log('activity logs', activityLogsData)
          
          setActivityLogs(activityLogsData)
        }

        if (data?.data?.hourly_attendance) {
          const groupedByDate: Record<string, number[]> = {};
          data.data.hourly_attendance.forEach(({ date, hour, count }) => {
            if (!groupedByDate[date]) {
              groupedByDate[date] = Array(24).fill(0);
            }
            groupedByDate[date][hour] = count;
          });
          const formatted = Object.entries(groupedByDate).map(
            ([date, hourlyCounts]) => ({
              name: date,
              data: hourlyCounts.map((count, hour) => ({
                x: hour.toString(),
                y: count,
              })),
            })
          );
          setHeatMapOptions((prev) => ({ ...prev }));
          setHeatMapSeries(formatted);
        }

        if (data?.data?.daily_attendance) {
          const series = data.data.daily_attendance.map((item) => item.count);
          const labels = data.data.daily_attendance.map((item) => item.date);
          setPieSeries(series);
          setPieOptions((prev) => ({ ...prev, labels }));
        }

        console.log('data attendance', data?.data)

      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
      });
  }, [selectedVenue]);

  // React.useEffect(() => {



  // }, [attendanceData])

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-blue-400 mb-2">Dashboard</h1>
      {/* Event Select Dropdown */}
      <div className="mb-4">
        <label htmlFor="event-select" className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
        <select
          id="event-select"
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="block w-64 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
        >
          {venues.map((venue, index) => (
            <option key={index} value={venue}>
              {venue}
            </option>
          ))}
        </select>
      </div>

      {/* Section 1: 1x4 Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        {cardData.map((card, i) => (
          <Card key={i} 
          //  className="rounded-xl shadow-lg border border-gray-200 bg-[#79B5D2] flex flex-col items-center justify-center text-center"
           className={clsx(
            'rounded-xl shadow-lg border border-gray-200 flex flex-col items-center justify-center text-center',
            {
              'bg-blue-100': card.color === 'blue',
              'bg-red-100': card.color === 'red',
              'bg-yellow-100': card.color === 'yellow',
              'bg-green-100': card.color === 'green',
            }
          )}
          >
            <CardHeader 
              className="flex flex-col items-center justify-center">
              {card.icon}
              <CardTitle 
                // className="text-lg font-semibold mb-1">
                className={clsx('text-lg font-semibold mb-1', {
                    'text-blue-700': card.color === 'blue',
                    'text-red-700': card.color === 'red',
                    'text-yellow-700': card.color === 'yellow',
                    'text-green-700': card.color === 'green',
                  })}
              > 
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent
              className={clsx('text-3xl font-bold', {
                'text-blue-500': card.color === 'blue',
                'text-red-500': card.color === 'red',
                'text-yellow-500': card.color === 'yellow',
                'text-green-500': card.color === 'green',
              })}
            >
              {card.value}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section 2: Flex row with two cards */}
      <div>
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <Card className="flex-[0.4] h-[600px] rounded-xl shadow-lg border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className='text-green-300 font-bold'>Event Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardCardWithCharts 
                pieSeries={pieSeries}
                pieOptions={pieOptions}
                heatMapSeries={heatMapSeries}
                heatMapOptions={heatMapOptions}
              />
            </CardContent>
          </Card>
          <Card className="flex-[0.6] h-[600px] rounded-xl shadow-lg border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className='text-red-400 font-bold'>Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              {activityLogs.map((activity) => {
                return <ActivityLogItem title={activity?.title} timestamp={activity.timestamp}/>
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardContent; 
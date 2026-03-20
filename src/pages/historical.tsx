import { useState } from "react";
import { format, subDays, isAfter, differenceInYears } from "date-fns";
import { motion } from "framer-motion";
import { History, AlertCircle } from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush,
  AreaChart, Area, ComposedChart, Scatter, ScatterChart, ZAxis
} from "recharts";

import { useLocation } from "@/hooks/use-location";
import { useHistoricalWeather, useHistoricalAirQuality } from "@/hooks/use-weather";
import { useUnit } from "@/lib/contexts/unit-context";
import { ChartCard, ChartCardSkeleton } from "@/components/weather/chart-card";

function windDegToCardinal(deg: number): string {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export default function Historical() {
  const location = useLocation();
  const { unit } = useUnit();
  
  const today = new Date();
  const [endDate, setEndDate] = useState<string>(format(today, 'yyyy-MM-dd'));
  const [startDate, setStartDate] = useState<string>(format(subDays(today, 30), 'yyyy-MM-dd'));
  const [dateError, setDateError] = useState<string | null>(null);

  const { 
    data: histData, 
    isLoading: histLoading, 
    error: histError 
  } = useHistoricalWeather({ lat: location.lat, lon: location.lon }, startDate, endDate);

  const { 
    data: aqData, 
    isLoading: aqLoading 
  } = useHistoricalAirQuality({ lat: location.lat, lon: location.lon }, startDate, endDate);

  const handleStartDateChange = (val: string) => {
    const start = new Date(val);
    const end = new Date(endDate);
    if (isAfter(start, end)) {
      setDateError("Start date cannot be after end date.");
      return;
    }
    if (differenceInYears(end, start) > 2) {
      setDateError("Date range cannot exceed 2 years.");
      return;
    }
    setDateError(null);
    setStartDate(val);
  };

  const handleEndDateChange = (val: string) => {
    const start = new Date(startDate);
    const end = new Date(val);
    if (isAfter(start, end)) {
      setDateError("End date cannot be before start date.");
      return;
    }
    if (differenceInYears(end, start) > 2) {
      setDateError("Date range cannot exceed 2 years.");
      return;
    }
    setDateError(null);
    setEndDate(val);
  };

  const twoYearsAgo = format(subDays(today, 365 * 2), 'yyyy-MM-dd');
  const tempUnit = `°${unit === 'celsius' ? 'C' : 'F'}`;

  const chartData = histData?.daily?.time.map((timeStr: string, index: number) => {
    const aqMatch = aqData?.daily?.time?.indexOf(timeStr);
    const sunriseStr = histData.daily.sunrise?.[index];
    const sunsetStr = histData.daily.sunset?.[index];

    let sunriseMinutes: number | null = null;
    let sunsetMinutes: number | null = null;
    let sunriseLabel = '';
    let sunsetLabel = '';

    if (sunriseStr) {
      const d = new Date(sunriseStr);
      sunriseMinutes = d.getHours() * 60 + d.getMinutes();
      sunriseLabel = format(d, 'h:mm a');
    }
    if (sunsetStr) {
      const d = new Date(sunsetStr);
      sunsetMinutes = d.getHours() * 60 + d.getMinutes();
      sunsetLabel = format(d, 'h:mm a');
    }

    const windDir = histData.daily.wind_direction_10m_dominant?.[index];

    return {
      date: format(new Date(timeStr), 'MMM dd'),
      fullDate: timeStr,
      tempMax: histData.daily.temperature_2m_max[index],
      tempMin: histData.daily.temperature_2m_min[index],
      tempMean: histData.daily.temperature_2m_mean[index],
      precip: histData.daily.precipitation_sum[index],
      windMax: histData.daily.wind_speed_10m_max[index],
      windDirDeg: windDir,
      windDir: windDir != null ? windDegToCardinal(windDir) : '',
      sunrise: sunriseMinutes,
      sunset: sunsetMinutes,
      sunriseLabel,
      sunsetLabel,
      pm10: aqMatch !== undefined && aqMatch !== -1 ? aqData!.daily.pm10[aqMatch] : null,
      pm25: aqMatch !== undefined && aqMatch !== -1 ? aqData!.daily.pm2_5[aqMatch] : null,
    };
  }) || [];

  const isLoading = location.isLoading || histLoading || aqLoading;

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const sunCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 text-xs shadow-lg">
          <p className="font-semibold mb-1">{payload[0]?.payload?.date}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: {minutesToTime(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pb-24 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border/50 pb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-2 text-sm font-semibold">
              <History className="w-4 h-4" />
              Long-term Analysis
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Historical Data
            </h1>
            <p className="text-lg text-muted-foreground">
              {location.isLoading ? "Detecting location..." : location.name}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col sm:flex-row items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm"
          >
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground font-medium w-10">From:</span>
              <input 
                type="date" 
                value={startDate}
                min={twoYearsAgo}
                max={endDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="bg-secondary/50 rounded-lg px-2 py-1.5 border-none text-foreground text-sm font-medium focus:ring-0 focus:outline-none cursor-pointer"
              />
            </div>
            <div className="w-full sm:w-px h-px sm:h-8 bg-border"></div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground font-medium w-10">To:</span>
              <input 
                type="date" 
                value={endDate}
                min={startDate}
                max={format(today, 'yyyy-MM-dd')}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="bg-secondary/50 rounded-lg px-2 py-1.5 border-none text-foreground text-sm font-medium focus:ring-0 focus:outline-none cursor-pointer"
              />
            </div>
          </motion.div>
        </div>

        {(dateError || histError) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="bg-destructive/10 border border-destructive/30 text-destructive p-5 rounded-2xl flex items-start gap-4 mb-8"
          >
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Error</h3>
              <p className="opacity-80 text-sm">{dateError || "Unable to load data. Check your connection or adjust the date range."}</p>
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <ChartCardSkeleton key={`hist-${i}`} />)
          ) : chartData.length > 0 && !dateError ? (
            <>
              {/* Temperature: Mean, Max, Min */}
              <ChartCard title={`Temperature Trend (${tempUnit})`} delay={0.1}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={40} />
                    <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="tempMax" name={`Max (${tempUnit})`} stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="tempMean" name={`Mean (${tempUnit})`} stroke="hsl(var(--chart-1))" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="tempMin" name={`Min (${tempUnit})`} stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                    <Brush dataKey="date" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Sunrise & Sunset */}
              <ChartCard title="Sunrise & Sunset Times (Local Time)" delay={0.15}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={40} />
                    <YAxis 
                      tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} 
                      axisLine={false} tickLine={false}
                      domain={[240, 1260]}
                      tickFormatter={(v) => minutesToTime(v)}
                    />
                    <Tooltip content={sunCustomTooltip} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="sunrise" name="Sunrise" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="sunset" name="Sunset" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
                    <Brush dataKey="date" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Precipitation Total */}
              <ChartCard title="Total Daily Precipitation (mm)" delay={0.2}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={40} />
                    <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} cursor={{ fill: 'hsl(var(--muted)/0.4)' }} />
                    <Bar dataKey="precip" name="Precipitation (mm)" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                    <Brush dataKey="date" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Wind: Max Speed + Dominant Direction */}
              <ChartCard title="Max Wind Speed (km/h) & Dominant Direction" delay={0.25}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={40} />
                    <YAxis yAxisId="left" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 360]} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false}
                      tickFormatter={(v) => windDegToCardinal(v)} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                      formatter={(value: any, name: string) => {
                        if (name === 'Wind Dir') return [windDegToCardinal(value), name];
                        return [`${value} km/h`, name];
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="windMax" name="Max Wind (km/h)" stroke="hsl(var(--chart-5))" strokeWidth={3} dot={false} />
                    <Scatter yAxisId="right" dataKey="windDirDeg" name="Wind Dir" fill="hsl(var(--chart-4))" opacity={0.6} />
                    <Brush dataKey="date" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Air Quality: PM10 & PM2.5 */}
              <ChartCard title="Daily Avg Air Quality — PM10 & PM2.5 (μg/m³)" delay={0.3}>
                {chartData.some((d: any) => d.pm10 != null || d.pm25 != null) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={40} />
                      <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Line type="monotone" dataKey="pm10" name="PM10 (μg/m³)" stroke="hsl(var(--chart-4))" strokeWidth={3} dot={false} connectNulls />
                      <Line type="monotone" dataKey="pm25" name="PM2.5 (μg/m³)" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls />
                      <Brush dataKey="date" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    Air quality historical data unavailable for this range.
                  </div>
                )}
              </ChartCard>
            </>
          ) : !dateError && !histError ? (
            <div className="text-center py-16 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Select a date range to view historical data.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

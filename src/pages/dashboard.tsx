import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  Thermometer, Droplets, Wind, Sun, Sunrise, Sunset, 
  CloudRain, Activity, AlertCircle, Calendar, MapPin,
  Gauge, FlaskConical, Leaf
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush
} from "recharts";

import { useLocation } from "@/hooks/use-location";
import { useWeatherForecast, useAirQuality } from "@/hooks/use-weather";
import { useUnit } from "@/lib/contexts/unit-context";
import { MetricCard, MetricCardSkeleton } from "@/components/weather/metric-card";
import { ChartCard, ChartCardSkeleton } from "@/components/weather/chart-card";
import { TimeOfDayBackground, StarField, getTimeOfDay } from "@/components/weather/card-animations";

const hour = new Date().getHours();
const tod = getTimeOfDay(hour);

export default function Dashboard() {
  const location = useLocation();
  const { unit } = useUnit();
  
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const { 
    data: forecast, 
    isLoading: forecastLoading, 
    error: forecastError 
  } = useWeatherForecast({ lat: location.lat, lon: location.lon }, date);

  const { 
    data: airQuality, 
    isLoading: aqLoading 
  } = useAirQuality({ lat: location.lat, lon: location.lon });

  const hourlyData = forecast?.hourly?.time.map((timeStr: string, index: number) => ({
    time: format(new Date(timeStr), 'h a'),
    temp: forecast.hourly.temperature_2m[index],
    humidity: forecast.hourly.relative_humidity_2m[index],
    precip: forecast.hourly.precipitation[index],
    visibility: Math.round((forecast.hourly.visibility[index] || 0) / 1000 * 10) / 10,
    wind: forecast.hourly.wind_speed_10m[index],
  })) || [];

  const aqHourlyData = airQuality?.hourly?.time.map((timeStr: string, index: number) => ({
    time: format(new Date(timeStr), 'h a'),
    pm10: airQuality.hourly.pm10[index],
    pm25: airQuality.hourly.pm2_5[index],
  })) || [];

  const isLoading = location.isLoading || forecastLoading || aqLoading;
  const tempUnit = `°${unit === 'celsius' ? 'C' : 'F'}`;
  const isCelsius = unit === 'celsius';

  const currentTemp = forecast?.current?.temperature_2m;
  const windSpeed = forecast?.daily?.wind_speed_10m_max?.[0];
  const uvIdx = forecast?.current?.uv_index ?? forecast?.daily?.uv_index_max?.[0];
  const humidity = forecast?.current?.relative_humidity_2m;
  const aqi = airQuality?.current?.european_aqi;

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Time-of-day ambient background */}
      <TimeOfDayBackground tod={tod} />
      <StarField visible={tod === 'night'} />

      {/* Hero image */}
      <div className="absolute inset-0 z-[-1] h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background z-10" />
        <img 
          src={`${import.meta.env.BASE_URL}images/weather-hero-bg.png`}
          alt="Atmospheric Background" 
          className="w-full h-full object-cover opacity-30 dark:opacity-15"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-1"
              style={{
                background: tod === 'dawn' ? 'rgba(251,146,60,0.15)' :
                            tod === 'dusk' ? 'rgba(168,85,247,0.15)' :
                            tod === 'night' ? 'rgba(99,102,241,0.15)' : 'rgba(14,165,233,0.15)',
                color: tod === 'dawn' ? '#f97316' :
                       tod === 'dusk' ? '#a855f7' :
                       tod === 'night' ? '#818cf8' : '#0ea5e9',
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {tod === 'dawn' ? '🌅 Golden Hour' :
               tod === 'dusk' ? '🌇 Dusk' :
               tod === 'night' ? '🌙 Night' : '☀️ Daytime'}
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Current Conditions
            </h1>
            <p className="text-lg text-muted-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {location.isLoading ? "Detecting location..." : location.error ? "Default Location (New York)" : location.name}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-card/60 backdrop-blur-md p-2 rounded-xl border border-border/50 shadow-sm"
          >
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <input 
              type="date" 
              value={date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none text-foreground font-medium focus:ring-0 focus:outline-none cursor-pointer w-full py-1 pr-2"
            />
          </motion.div>
        </div>

        {/* Error State */}
        {forecastError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive p-6 rounded-2xl flex items-start gap-4 mb-8">
            <AlertCircle className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">Unable to load weather data</h3>
              <p className="opacity-80">Please check your connection or try a different date.</p>
            </div>
          </div>
        )}

        {location.error && (
          <div className="bg-accent border border-accent-foreground/20 p-4 rounded-xl mb-6 text-sm text-accent-foreground">
            {location.error} Showing weather for New York as default.
          </div>
        )}

        {/* ===== TEMPERATURE ===== */}
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 mt-2 uppercase tracking-wider">Temperature</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={i} />)
          ) : forecast ? (
            <>
              <MetricCard 
                title="Current Temperature" 
                value={forecast.current.temperature_2m} 
                unit={tempUnit}
                icon={<Thermometer className="w-5 h-5" />}
                subtitle="Today's reading"
                delay={0.05}
                animationType="temperature"
                animationData={{ temp: currentTemp, celsius: isCelsius }}
              />
              <MetricCard 
                title="Maximum Temperature" 
                value={forecast.daily.temperature_2m_max[0]} 
                unit={tempUnit}
                icon={<Thermometer className="w-5 h-5" />}
                subtitle="Daily high"
                delay={0.1}
                animationType="temperature"
                animationData={{ temp: forecast.daily.temperature_2m_max[0], celsius: isCelsius }}
              />
              <MetricCard 
                title="Minimum Temperature" 
                value={forecast.daily.temperature_2m_min[0]} 
                unit={tempUnit}
                icon={<Thermometer className="w-5 h-5" />}
                subtitle="Daily low"
                delay={0.15}
                animationType="temperature"
                animationData={{ temp: forecast.daily.temperature_2m_min[0], celsius: isCelsius }}
              />
            </>
          ) : null}
        </div>

        {/* ===== ATMOSPHERIC CONDITIONS ===== */}
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Atmospheric Conditions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={`atm-${i}`} />)
          ) : forecast ? (
            <>
              <MetricCard 
                title="Precipitation" 
                value={forecast.daily.precipitation_sum?.[0] ?? forecast.current.precipitation} 
                unit="mm"
                icon={<CloudRain className="w-5 h-5" />}
                subtitle={`Probability: ${forecast.daily.precipitation_probability_max[0]}%`}
                delay={0.2}
                animationType="precipitation"
                animationData={{ precip: forecast.daily.precipitation_sum?.[0] ?? forecast.current.precipitation }}
              />
              <MetricCard 
                title="Relative Humidity" 
                value={forecast.current.relative_humidity_2m} 
                unit="%"
                icon={<Droplets className="w-5 h-5" />}
                subtitle="Moisture in the air"
                delay={0.25}
                animationType="humidity"
                animationData={{ humidity }}
              />
              <MetricCard 
                title="UV Index" 
                value={forecast.current.uv_index ?? forecast.daily.uv_index_max[0]} 
                icon={<Sun className="w-5 h-5" />}
                subtitle={`Daily Max: ${forecast.daily.uv_index_max[0]}`}
                delay={0.3}
                animationType="uv"
                animationData={{ uv: uvIdx }}
              />
            </>
          ) : null}
        </div>

        {/* ===== SUN CYCLE ===== */}
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Sun Cycle</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <MetricCardSkeleton key={`sun-${i}`} />)
          ) : forecast ? (
            <>
              <MetricCard 
                title="Sunrise" 
                value={format(new Date(forecast.daily.sunrise[0]), 'h:mm a')} 
                icon={<Sunrise className="w-5 h-5" />}
                subtitle={format(new Date(forecast.daily.sunrise[0]), 'EEEE, MMM d')}
                delay={0.35}
                animationType="sunrise"
              />
              <MetricCard 
                title="Sunset" 
                value={format(new Date(forecast.daily.sunset[0]), 'h:mm a')} 
                icon={<Sunset className="w-5 h-5" />}
                subtitle={format(new Date(forecast.daily.sunset[0]), 'EEEE, MMM d')}
                delay={0.4}
                animationType="sunset"
              />
            </>
          ) : null}
        </div>

        {/* ===== WIND & AIR ===== */}
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Wind & Air</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <MetricCardSkeleton key={`wind-${i}`} />)
          ) : forecast ? (
            <>
              <MetricCard 
                title="Max Wind Speed" 
                value={forecast.daily.wind_speed_10m_max[0]} 
                unit="km/h"
                icon={<Wind className="w-5 h-5" />}
                subtitle={`Current: ${forecast.current.wind_speed_10m} km/h`}
                delay={0.45}
                animationType="wind"
                animationData={{ speed: windSpeed }}
              />
              <MetricCard 
                title="Precipitation Probability Max" 
                value={forecast.daily.precipitation_probability_max[0]} 
                unit="%"
                icon={<CloudRain className="w-5 h-5" />}
                subtitle="Chance of rain today"
                delay={0.5}
                animationType="precipitation"
                animationData={{ precip: forecast.daily.precipitation_probability_max[0] / 10 }}
              />
            </>
          ) : null}
        </div>

        {/* ===== AIR QUALITY ===== */}
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Air Quality Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <MetricCardSkeleton key={`aq-${i}`} />)
          ) : airQuality ? (
            <>
              <MetricCard 
                title="Air Quality Index" 
                value={airQuality.current.european_aqi ?? '—'} 
                icon={<Activity className="w-5 h-5" />}
                subtitle="European AQI scale"
                delay={0.55}
                animationType="aqi"
                animationData={{ aqi }}
              />
              <MetricCard 
                title="PM10" 
                value={airQuality.current.pm10 != null ? airQuality.current.pm10.toFixed(1) : '—'} 
                unit="μg/m³"
                icon={<Gauge className="w-5 h-5" />}
                subtitle="Coarse particulate matter"
                delay={0.6}
                animationType="pm"
                animationData={{ aqi: airQuality.current.pm10 ?? 30 }}
              />
              <MetricCard 
                title="PM2.5" 
                value={airQuality.current.pm2_5 != null ? airQuality.current.pm2_5.toFixed(1) : '—'} 
                unit="μg/m³"
                icon={<Gauge className="w-5 h-5" />}
                subtitle="Fine particulate matter"
                delay={0.65}
                animationType="pm"
                animationData={{ aqi: airQuality.current.pm2_5 ?? 20 }}
              />
              <MetricCard 
                title="Carbon Monoxide (CO)" 
                value={airQuality.current.carbon_monoxide != null ? airQuality.current.carbon_monoxide.toFixed(1) : '—'} 
                unit="μg/m³"
                icon={<FlaskConical className="w-5 h-5" />}
                subtitle="CO concentration"
                delay={0.7}
                animationType="co"
              />
              <MetricCard 
                title="Nitrogen Dioxide (NO₂)" 
                value={airQuality.current.nitrogen_dioxide != null ? airQuality.current.nitrogen_dioxide.toFixed(1) : '—'} 
                unit="μg/m³"
                icon={<Leaf className="w-5 h-5" />}
                subtitle="NO₂ concentration"
                delay={0.75}
                animationType="no2"
              />
              <MetricCard 
                title="Sulphur Dioxide (SO₂)" 
                value={airQuality.current.sulphur_dioxide != null ? airQuality.current.sulphur_dioxide.toFixed(1) : '—'} 
                unit="μg/m³"
                icon={<FlaskConical className="w-5 h-5" />}
                subtitle="SO₂ concentration"
                delay={0.8}
                animationType="so2"
              />
            </>
          ) : (
            <div className="col-span-full text-sm text-muted-foreground text-center py-4">
              Air quality data unavailable for this location.
            </div>
          )}
        </div>

        <div className="mb-8 text-xs text-muted-foreground/70 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Note: CO₂ (carbon dioxide) is not available from the Open-Meteo API. All other pollutants are shown above.
        </div>

        {/* ===== HOURLY CHARTS ===== */}
        <h2 className="text-xl font-bold text-foreground mb-6">Hourly Forecast Charts</h2>
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ChartCardSkeleton key={`chart-${i}`} />)
          ) : hourlyData.length > 0 ? (
            <>
              <ChartCard title={`Temperature (${tempUnit})`} delay={0.1}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={20} />
                    <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Area type="monotone" dataKey="temp" name={`Temp (${tempUnit})`} stroke="hsl(var(--chart-1))" strokeWidth={3} fillOpacity={1} fill="url(#tempGrad)" />
                    <Brush dataKey="time" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Relative Humidity (%)" delay={0.15}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="humidGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={20} />
                    <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Area type="monotone" dataKey="humidity" name="Humidity (%)" stroke="hsl(var(--chart-2))" strokeWidth={3} fillOpacity={1} fill="url(#humidGrad)" />
                    <Brush dataKey="time" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Precipitation (mm)" delay={0.2}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={20} />
                    <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                    <Bar dataKey="precip" name="Precipitation (mm)" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                    <Brush dataKey="time" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Visibility (km)" delay={0.25}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={20} />
                    <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                    <Area type="monotone" dataKey="visibility" name="Visibility (km)" stroke="hsl(var(--chart-5))" strokeWidth={3} fillOpacity={1} fill="url(#visGrad)" />
                    <Brush dataKey="time" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Wind Speed 10m (km/h)" delay={0.3}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={20} />
                    <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                    <Line type="monotone" dataKey="wind" name="Wind Speed (km/h)" stroke="hsl(var(--chart-3))" strokeWidth={3} dot={false} />
                    <Brush dataKey="time" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="PM10 & PM2.5 Particulates (μg/m³)" delay={0.35}>
                {aqHourlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aqHourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} minTickGap={20} />
                      <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Line type="monotone" dataKey="pm10" name="PM10 (μg/m³)" stroke="hsl(var(--chart-4))" strokeWidth={3} dot={false} connectNulls />
                      <Line type="monotone" dataKey="pm25" name="PM2.5 (μg/m³)" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls />
                      <Brush dataKey="time" height={20} stroke="hsl(var(--border))" fill="hsl(var(--card))" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    Air quality hourly data unavailable
                  </div>
                )}
              </ChartCard>
            </>
          ) : !forecastError ? (
            <div className="text-center py-12 text-muted-foreground">
              Select a date to view hourly charts.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

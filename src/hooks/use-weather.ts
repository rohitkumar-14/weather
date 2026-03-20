import { useQuery } from '@tanstack/react-query';
import { useUnit } from '@/lib/contexts/unit-context';

interface LocationInput {
  lat: number;
  lon: number;
}

// -----------------------------------------------------
// 1. Current & Hourly Forecast
// -----------------------------------------------------
export function useWeatherForecast({ lat, lon }: LocationInput, date: string) {
  const { unit } = useUnit();
  
  return useQuery({
    queryKey: ['weather', 'forecast', lat, lon, date, unit],
    queryFn: async () => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max,wind_speed_10m_max,precipitation_probability_max&hourly=temperature_2m,relative_humidity_2m,precipitation,visibility,wind_speed_10m,weather_code&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,uv_index&timezone=auto&start_date=${date}&end_date=${date}&temperature_unit=${unit}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!lat && !!lon && !!date,
  });
}

// -----------------------------------------------------
// 2. Current Air Quality
// -----------------------------------------------------
export function useAirQuality({ lat, lon }: LocationInput) {
  return useQuery({
    queryKey: ['weather', 'air-quality', lat, lon],
    queryFn: async () => {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide&hourly=pm10,pm2_5&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch air quality');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!lat && !!lon,
  });
}

// -----------------------------------------------------
// 3. Historical Weather
// -----------------------------------------------------
export function useHistoricalWeather({ lat, lon }: LocationInput, startDate: string, endDate: string) {
  const { unit } = useUnit();

  return useQuery({
    queryKey: ['weather', 'historical', lat, lon, startDate, endDate, unit],
    queryFn: async () => {
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,sunrise,sunset,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto&temperature_unit=${unit}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch historical weather');
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour (historical data doesn't change often)
    enabled: !!lat && !!lon && !!startDate && !!endDate,
  });
}

// -----------------------------------------------------
// 4. Historical Air Quality
// -----------------------------------------------------
export function useHistoricalAirQuality({ lat, lon }: LocationInput, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['weather', 'historical-aq', lat, lon, startDate, endDate],
    queryFn: async () => {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=pm10,pm2_5&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch historical air quality');
      
      const data = await res.json();
      
      // Aggregate hourly to daily for charting
      const dailyMap = new Map<string, { pm10_sum: number, pm25_sum: number, count: number }>();
      
      if (data.hourly && data.hourly.time) {
        data.hourly.time.forEach((timeStr: string, index: number) => {
          const date = timeStr.split('T')[0];
          const pm10 = data.hourly.pm10[index] || 0;
          const pm25 = data.hourly.pm2_5[index] || 0;
          
          if (!dailyMap.has(date)) {
            dailyMap.set(date, { pm10_sum: 0, pm25_sum: 0, count: 0 });
          }
          const curr = dailyMap.get(date)!;
          curr.pm10_sum += pm10;
          curr.pm25_sum += pm25;
          curr.count += 1;
        });
      }
      
      const dailyAggregated = {
        time: Array.from(dailyMap.keys()),
        pm10: Array.from(dailyMap.values()).map(v => Number((v.pm10_sum / v.count).toFixed(1))),
        pm2_5: Array.from(dailyMap.values()).map(v => Number((v.pm25_sum / v.count).toFixed(1))),
      };
      
      return { daily: dailyAggregated };
    },
    staleTime: 60 * 60 * 1000,
    enabled: !!lat && !!lon && !!startDate && !!endDate,
  });
}

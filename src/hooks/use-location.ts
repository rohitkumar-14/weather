import { useState, useEffect } from 'react';

export interface LocationState {
  lat: number;
  lon: number;
  name: string;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_LOCATION = {
  lat: 40.7128,
  lon: -74.0060,
  name: "New York",
};

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    ...DEFAULT_LOCATION,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchCityName(lat: number, lon: number) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: { 'Accept-Language': 'en' }
        });
        const data = await res.json();
        if (!mounted) return;
        const name = data.address?.city ||
                     data.address?.town ||
                     data.address?.village ||
                     data.address?.suburb ||
                     data.address?.county ||
                     "Selected Location";
        setLocation({ lat, lon, name, isLoading: false, error: null });
      } catch {
        if (mounted) {
          setLocation({ lat, lon, name: "Selected Location", isLoading: false, error: null });
        }
      }
    }

    function useDefault(reason: string) {
      if (!mounted) return;
      setLocation({ ...DEFAULT_LOCATION, isLoading: false, error: reason });
      fetchCityName(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
    }

    if (!navigator.geolocation) {
      useDefault("Geolocation not supported.");
      return;
    }

    const timeoutId = setTimeout(() => {
      useDefault("Location detection timed out.");
    }, 4000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        if (mounted) fetchCityName(latitude, longitude);
      },
      () => {
        clearTimeout(timeoutId);
        useDefault("Location access denied. Showing New York as default.");
      },
      { timeout: 3500, maximumAge: 60000 }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return location;
}

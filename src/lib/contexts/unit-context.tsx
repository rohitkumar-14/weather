import React, { createContext, useContext, useState, useEffect } from 'react';

type Unit = 'celsius' | 'fahrenheit';

interface UnitContextType {
  unit: Unit;
  setUnit: (unit: Unit) => void;
  toggleUnit: () => void;
  getTempStr: (celsiusVal: number) => string;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnitState] = useState<Unit>('celsius');

  useEffect(() => {
    const saved = localStorage.getItem('weather-unit') as Unit;
    if (saved && (saved === 'celsius' || saved === 'fahrenheit')) {
      setUnitState(saved);
    }
  }, []);

  const setUnit = (newUnit: Unit) => {
    setUnitState(newUnit);
    localStorage.setItem('weather-unit', newUnit);
  };

  const toggleUnit = () => {
    setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  // Utility to convert a raw value if the API returned celsius, 
  // though OpenMeteo handles the conversion natively via API params.
  // We include this just in case we need manual conversion.
  const getTempStr = (val: number) => {
    return `${val.toFixed(1)}°${unit === 'celsius' ? 'C' : 'F'}`;
  };

  return (
    <UnitContext.Provider value={{ unit, setUnit, toggleUnit, getTempStr }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
}

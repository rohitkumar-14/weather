import { Link, useLocation } from "wouter";
import { CloudRain, MapPin, Activity, Thermometer } from "lucide-react";
import { useUnit } from "@/lib/contexts/unit-context";
import { LocationState } from "@/hooks/use-location";
import { motion } from "framer-motion";

export function Navbar({ location }: { location: LocationState }) {
  const [pathname] = useLocation();
  const { unit, toggleUnit } = useUnit();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-tr from-primary to-cyan-400 p-2 rounded-xl text-white shadow-sm shadow-primary/20">
                <CloudRain className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg hidden sm:block text-foreground">
                Atmos
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-secondary-foreground truncate max-w-[150px]">
                {location.isLoading ? "Detecting..." : location.name}
              </span>
            </div>
          </div>

          {/* Navigation Links & Controls */}
          <div className="flex items-center gap-1 sm:gap-4">
            <nav className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg border border-border/50">
              <Link 
                href="/" 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  pathname === "/" 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Current</span>
              </Link>
              <Link 
                href="/historical" 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  pathname === "/historical" 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Thermometer className="w-4 h-4" />
                <span className="hidden sm:inline">Historical</span>
              </Link>
            </nav>

            <button
              onClick={toggleUnit}
              className="ml-2 w-10 h-10 flex items-center justify-center rounded-xl bg-background border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-sm font-bold text-foreground"
              aria-label="Toggle Temperature Unit"
            >
              °{unit === 'celsius' ? 'C' : 'F'}
            </button>
          </div>
          
        </div>
      </div>
    </motion.header>
  );
}

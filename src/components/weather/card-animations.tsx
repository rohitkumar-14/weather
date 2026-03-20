import { motion } from "framer-motion";
import { useMemo } from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────
function rand(min: number, max: number, seed = 0) {
  return min + ((seed * 7 + 13) % 17) / 17 * (max - min);
}

// ─── Rain Drops ─────────────────────────────────────────────────────────────
export function RainAnimation({ intensity = 1 }: { intensity?: number }) {
  const drops = useMemo(() =>
    Array.from({ length: Math.round(12 * intensity) }, (_, i) => ({
      id: i,
      x: rand(5, 95, i * 3),
      delay: rand(0, 2, i * 7),
      duration: rand(0.8, 1.5, i * 11),
      height: rand(8, 20, i * 5),
      opacity: rand(0.3, 0.7, i * 13),
    })), [intensity]);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {drops.map((d) => (
        <motion.line
          key={d.id}
          x1={d.x} x2={d.x - 1}
          initial={{ y1: -5, y2: -5 + d.height, opacity: 0 }}
          animate={{ y1: [0, 110], y2: [d.height, 110 + d.height], opacity: [0, d.opacity, d.opacity, 0] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "linear" }}
          stroke="hsl(var(--chart-2))"
          strokeWidth="0.6"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// ─── Sun Rays ───────────────────────────────────────────────────────────────
export function SunAnimation({ size = 40 }: { size?: number }) {
  const rays = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg className="absolute right-2 top-2 w-20 h-20 opacity-20" viewBox="0 0 80 80">
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ originX: "40px", originY: "40px" }}
      >
        {rays.map((angle) => (
          <motion.line
            key={angle}
            x1="40" y1="10" x2="40" y2="4"
            stroke="hsl(var(--chart-3))"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${angle} 40 40)`}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: angle / 360 }}
          />
        ))}
      </motion.g>
      <motion.circle
        cx="40" cy="40" r="12"
        fill="hsl(var(--chart-3))"
        animate={{ r: [11, 13, 11], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ─── UV Pulse ──────────────────────────────────────────────────────────────
export function UVAnimation({ uvIndex = 5 }: { uvIndex?: number }) {
  const rings = [1, 2, 3];
  const color = uvIndex >= 8 ? "0 80% 60%" : uvIndex >= 5 ? "25 90% 55%" : "60 90% 50%";
  return (
    <svg className="absolute right-0 top-0 w-24 h-24 opacity-20" viewBox="0 0 80 80">
      {rings.map((r) => (
        <motion.circle
          key={r}
          cx="60" cy="20" r={r * 10}
          fill="none"
          stroke={`hsl(${color})`}
          strokeWidth="1"
          animate={{ r: [r * 8, r * 12, r * 8], opacity: [0.6, 0.1, 0.6] }}
          transition={{ duration: 2.5 + r * 0.5, repeat: Infinity, ease: "easeInOut", delay: r * 0.4 }}
        />
      ))}
      <motion.circle
        cx="60" cy="20" r="8"
        fill={`hsl(${color})`}
        animate={{ r: [7, 9, 7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ─── Wind Lines ─────────────────────────────────────────────────────────────
export function WindAnimation({ speed = 20 }: { speed?: number }) {
  const lines = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      y: 15 + i * 14,
      width: rand(30, 70, i * 9),
      delay: rand(0, 1.5, i * 13),
      duration: Math.max(0.8, 2 - speed / 60),
    })), [speed]);

  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
      {lines.map((l) => (
        <motion.line
          key={l.id}
          y1={l.y} y2={l.y}
          initial={{ x1: 100, x2: 100 + l.width }}
          animate={{ x1: [-l.width, 100], x2: [0, 100 + l.width] }}
          transition={{ duration: l.duration, delay: l.delay, repeat: Infinity, ease: "linear" }}
          stroke="hsl(var(--chart-5))"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// ─── Humidity Drops ─────────────────────────────────────────────────────────
export function HumidityAnimation({ humidity = 60 }: { humidity?: number }) {
  const count = Math.max(3, Math.round(humidity / 15));
  const drops = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand(15, 85, i * 17),
      size: rand(3, 7, i * 11),
      delay: rand(0, 3, i * 7),
      duration: rand(2, 4, i * 13),
    })), [count]);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {drops.map((d) => (
        <motion.ellipse
          key={d.id}
          cx={d.x}
          rx={d.size * 0.6}
          ry={d.size}
          fill="hsl(var(--chart-2))"
          initial={{ cy: -10, opacity: 0 }}
          animate={{ cy: [0, 110], opacity: [0, 0.4, 0.4, 0] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeIn" }}
        />
      ))}
    </svg>
  );
}

// ─── Floating Particles (AQI) ───────────────────────────────────────────────
export function ParticleAnimation({ aqi = 50, color = "var(--chart-4)" }: { aqi?: number; color?: string }) {
  const count = Math.min(20, Math.max(4, Math.round(aqi / 10)));
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand(10, 90, i * 11),
      y: rand(10, 90, i * 7),
      size: rand(1.5, 4, i * 13),
      dx: rand(-15, 15, i * 9),
      dy: rand(-15, 15, i * 17),
      delay: rand(0, 3, i * 5),
      duration: rand(3, 6, i * 19),
    })), [count]);

  return (
    <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          r={p.size}
          fill={`hsl(${color})`}
          animate={{
            cx: [p.x, p.x + p.dx, p.x],
            cy: [p.y, p.y + p.dy, p.y],
            opacity: [0, 0.8, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

// ─── Gas Swirl (CO, NO2, SO2) ───────────────────────────────────────────────
export function GasAnimation({ color = "258 70% 60%" }: { color?: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M ${20 + i * 30} 80 Q ${30 + i * 30} ${40 + i * 5} ${40 + i * 20} 20`}
          fill="none"
          stroke={`hsl(${color})`}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: 3, delay: i * 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

// ─── Thermometer Fill ──────────────────────────────────────────────────────
export function ThermometerAnimation({ temp, isCelsius = true }: { temp?: number; isCelsius?: boolean }) {
  const celsius = isCelsius ? (temp ?? 20) : ((temp ?? 68) - 32) * 5 / 9;
  const fillPct = Math.min(100, Math.max(0, ((celsius + 20) / 60) * 100));
  const hue = Math.round(240 - (fillPct / 100) * 200);

  return (
    <svg className="absolute right-3 top-3 w-10 h-20 opacity-25" viewBox="0 0 30 70">
      <rect x="11" y="5" width="8" height="45" rx="4" fill="hsl(var(--muted))" />
      <motion.rect
        x="11" width="8" rx="4"
        fill={`hsl(${hue} 80% 55%)`}
        initial={{ y: 50, height: 0 }}
        animate={{ y: 50 - fillPct * 0.38, height: fillPct * 0.38 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
      />
      <circle cx="15" cy="55" r="9" fill={`hsl(${hue} 80% 55%)`} />
      <motion.circle
        cx="15" cy="55" r="9"
        fill={`hsl(${hue} 80% 55%)`}
        animate={{ r: [8, 10, 8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ─── Sunrise Arc ───────────────────────────────────────────────────────────
export function SunriseAnimation() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.path
        d="M 10 75 Q 50 20 90 75"
        fill="none"
        stroke="hsl(var(--chart-3))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
      />
      <motion.circle
        r="8"
        fill="hsl(25 95% 62%)"
        initial={{ cx: 10, cy: 75, scale: 0.5, opacity: 0 }}
        animate={{ cx: 50, cy: 35, scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <motion.line
          key={angle}
          x1="50" y1="35"
          stroke="hsl(25 95% 62%)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ x2: 50, y2: 35, opacity: 0 }}
          animate={{
            x2: 50 + Math.cos((angle * Math.PI) / 180) * 14,
            y2: 35 + Math.sin((angle * Math.PI) / 180) * 14,
            opacity: [0, 0.8, 0.6],
          }}
          transition={{ duration: 0.8, delay: 1.5 + angle / 800, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

// ─── Sunset Arc ────────────────────────────────────────────────────────────
export function SunsetAnimation() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.path
        d="M 10 35 Q 50 80 90 35"
        fill="none"
        stroke="hsl(var(--chart-4))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
      />
      <motion.circle
        r="8"
        fill="hsl(var(--chart-4))"
        initial={{ cx: 50, cy: 35, opacity: 1 }}
        animate={{ cx: 90, cy: 35, opacity: [1, 0.8, 0.4] }}
        transition={{ duration: 2, ease: "easeIn", delay: 0.2 }}
      />
    </svg>
  );
}

// ─── Time-of-Day Ambient ────────────────────────────────────────────────────
export type TimeOfDay = "dawn" | "day" | "dusk" | "night";

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

export function TimeOfDayBackground({ tod }: { tod: TimeOfDay }) {
  const gradients: Record<TimeOfDay, string> = {
    dawn: "from-orange-950/30 via-rose-900/20 to-amber-800/10",
    day:  "from-sky-900/20 via-blue-800/10 to-transparent",
    dusk: "from-purple-950/30 via-orange-900/20 to-rose-800/10",
    night:"from-slate-950/60 via-blue-950/30 to-transparent",
  };

  return (
    <motion.div
      key={tod}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className={`absolute inset-0 z-[-2] bg-gradient-to-br ${gradients[tod]} pointer-events-none`}
    />
  );
}

export function StarField({ visible }: { visible: boolean }) {
  const stars = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: rand(0, 100, i * 7),
      y: rand(0, 50, i * 11),
      size: rand(0.5, 2, i * 13),
      delay: rand(0, 4, i * 9),
    })), []);

  if (!visible) return null;

  return (
    <svg className="absolute inset-0 w-full h-[500px] z-[-1] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {stars.map((s) => (
        <motion.circle
          key={s.id}
          cx={`${s.x}%`} cy={`${s.y}%`} r={s.size}
          fill="white"
          animate={{ opacity: [0.2, 1, 0.2], r: [s.size, s.size * 1.3, s.size] }}
          transition={{ duration: 2 + s.delay, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

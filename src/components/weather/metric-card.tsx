import React from 'react';
import { motion } from 'framer-motion';
import {
  RainAnimation, SunAnimation, UVAnimation, WindAnimation,
  HumidityAnimation, ParticleAnimation, GasAnimation,
  ThermometerAnimation, SunriseAnimation, SunsetAnimation,
} from './card-animations';

export type CardAnimationType =
  | 'temperature'
  | 'humidity'
  | 'uv'
  | 'precipitation'
  | 'wind'
  | 'sunrise'
  | 'sunset'
  | 'aqi'
  | 'pm'
  | 'co'
  | 'no2'
  | 'so2'
  | 'none';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  subtitle?: string;
  delay?: number;
  animationType?: CardAnimationType;
  animationData?: Record<string, number | boolean>;
}

function CardAnimation({ type, data }: { type: CardAnimationType; data?: Record<string, number | boolean> }) {
  switch (type) {
    case 'temperature':
      return <ThermometerAnimation temp={data?.temp as number} isCelsius={data?.celsius as boolean ?? true} />;
    case 'humidity':
      return <HumidityAnimation humidity={data?.humidity as number ?? 60} />;
    case 'uv':
      return <UVAnimation uvIndex={data?.uv as number ?? 5} />;
    case 'precipitation':
      return <RainAnimation intensity={Math.min(3, Math.max(0.3, (data?.precip as number ?? 5) / 5))} />;
    case 'wind':
      return <WindAnimation speed={data?.speed as number ?? 20} />;
    case 'sunrise':
      return <SunriseAnimation />;
    case 'sunset':
      return <SunsetAnimation />;
    case 'aqi':
      return <ParticleAnimation aqi={data?.aqi as number ?? 50} color="var(--chart-4)" />;
    case 'pm':
      return <ParticleAnimation aqi={data?.aqi as number ?? 30} color="var(--chart-3)" />;
    case 'co':
      return <GasAnimation color="25 80% 55%" />;
    case 'no2':
      return <GasAnimation color="168 70% 45%" />;
    case 'so2':
      return <GasAnimation color="258 70% 60%" />;
    default:
      return null;
  }
}

const cardAccents: Partial<Record<CardAnimationType, string>> = {
  temperature: 'border-orange-500/20 dark:border-orange-400/15',
  humidity:    'border-blue-400/20 dark:border-blue-400/15',
  uv:          'border-yellow-500/25 dark:border-yellow-400/15',
  precipitation:'border-sky-400/20 dark:border-sky-400/15',
  wind:        'border-teal-400/20 dark:border-teal-400/15',
  sunrise:     'border-orange-400/25 dark:border-amber-400/20',
  sunset:      'border-purple-400/20 dark:border-pink-400/15',
  aqi:         'border-violet-400/20 dark:border-violet-400/15',
  pm:          'border-rose-400/20 dark:border-rose-400/15',
  co:          'border-amber-400/15',
  no2:         'border-emerald-400/15',
  so2:         'border-indigo-400/15',
};

const iconAccents: Partial<Record<CardAnimationType, string>> = {
  temperature: 'bg-orange-500/10 text-orange-500 dark:text-orange-400',
  humidity:    'bg-blue-500/10 text-blue-500 dark:text-blue-400',
  uv:          'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  precipitation:'bg-sky-500/10 text-sky-500 dark:text-sky-400',
  wind:        'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  sunrise:     'bg-orange-500/10 text-orange-500 dark:text-amber-400',
  sunset:      'bg-purple-500/10 text-purple-500 dark:text-pink-400',
  aqi:         'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  pm:          'bg-rose-500/10 text-rose-500 dark:text-rose-400',
  co:          'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  no2:         'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  so2:         'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
};

export function MetricCard({ title, value, unit, icon, subtitle, delay = 0, animationType = 'none', animationData }: MetricCardProps) {
  const borderCls = animationType !== 'none'
    ? cardAccents[animationType] ?? 'border-white/20 dark:border-white/10'
    : 'border-white/20 dark:border-white/10';
  const iconCls = animationType !== 'none'
    ? iconAccents[animationType] ?? 'bg-primary/10 text-primary'
    : 'bg-primary/10 text-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden bg-card/70 backdrop-blur-sm rounded-2xl p-5 border shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300 ${borderCls}`}
    >
      {/* Animated background layer */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
        <CardAnimation type={animationType} data={animationData} />
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div className="flex items-center gap-2">
          <motion.div
            className={`p-2 rounded-lg ${iconCls}`}
            animate={animationType === 'wind' ? { x: [0, 2, 0] } : animationType === 'precipitation' ? { y: [0, 1, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {icon}
          </motion.div>
          <h3 className="font-medium text-muted-foreground text-sm">{title}</h3>
        </div>
        
        <div>
          <div className="flex items-baseline gap-1">
            <motion.span
              className="text-3xl font-bold text-foreground"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: delay + 0.15, ease: "backOut" }}
            >
              {value}
            </motion.span>
            {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function MetricCardSkeleton() {
  return (
    <motion.div
      className="bg-card/40 rounded-2xl p-5 border border-border/50 h-[140px] flex flex-col justify-between overflow-hidden relative"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-muted"></div>
        <div className="w-24 h-4 rounded bg-muted"></div>
      </div>
      <div>
        <div className="w-20 h-8 rounded bg-muted mb-2"></div>
        <div className="w-32 h-3 rounded bg-muted"></div>
      </div>
    </motion.div>
  );
}

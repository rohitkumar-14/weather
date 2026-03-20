import React from 'react';
import { motion } from 'framer-motion';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

export function ChartCard({ title, children, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-card/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-white/10 shadow-lg shadow-black/5"
    >
      <h3 className="text-lg font-display font-semibold text-foreground mb-6">{title}</h3>
      <div className="w-full overflow-hidden">
        {/* The inner container forces horizontal scroll on mobile while keeping chart aspect ratio */}
        <div className="chart-scroll-container overflow-x-auto w-full pb-4">
          <div className="min-w-[600px] h-[300px]">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className="bg-card/40 rounded-2xl p-6 border border-border/50 animate-pulse">
      <div className="w-48 h-6 rounded bg-muted mb-6"></div>
      <div className="w-full h-[300px] rounded-xl bg-muted/50"></div>
    </div>
  );
}

import { motion } from 'motion/react';

export default function ProductSkeleton() {
  return (
    <div className="glass-card animate-pulse">
      <div className="aspect-[4/5] bg-surface shimmer" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <div className="h-6 w-2/3 bg-surface rounded shimmer" />
          <div className="h-6 w-1/4 bg-surface rounded shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-surface rounded shimmer" />
          <div className="h-4 w-5/6 bg-surface rounded shimmer" />
        </div>
        <div className="h-10 w-full bg-surface rounded-xl shimmer" />
      </div>
    </div>
  );
}

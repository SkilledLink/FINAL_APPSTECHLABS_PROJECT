import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SwapSlotProps {
  active: string;
  children: Record<string, ReactNode>;
  duration?: number;
}

export function SwapSlot({ active, children, duration = 0.15 }: SwapSlotProps) {
  return (
    <>
      {Object.entries(children).map(([key, node]) => (
        <motion.g
          key={key}
          initial={false}
          animate={{ opacity: key === active ? 1 : 0 }}
          transition={{ duration }}
          style={{ pointerEvents: 'none' }}
        >
          {node}
        </motion.g>
      ))}
    </>
  );
}
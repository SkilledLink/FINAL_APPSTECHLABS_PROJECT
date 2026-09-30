import { motion, type MotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { pivots, type JointName } from '../../../tokens/kito';

interface JointProps extends MotionProps {
  name: JointName;
  id?: string;
  children: ReactNode;
}

export function Joint({ name, id, children, ...motionProps }: JointProps) {
  const pivot = pivots[name];
  return (
    <motion.g
      id={id ?? name}
      style={{ transformOrigin: `${pivot.x}px ${pivot.y}px` }}
      {...motionProps}
    >
      {children}
    </motion.g>
  );
}
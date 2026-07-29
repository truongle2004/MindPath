import { motion } from 'motion/react';

export function FocusGlow(props: { isActive: boolean }) {
  if (!props.isActive) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: [0.14, 0.24, 0.14], scale: [0.96, 1.04, 0.96] }}
      className="pointer-events-none absolute inset-x-10 top-16 h-56 rounded-full bg-primary/20 blur-3xl"
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

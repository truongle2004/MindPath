import { motion } from 'motion/react';

export function ModeBadge(props: { isActive: boolean; label: string }) {
  return (
    <motion.span
      animate={props.isActive ? { opacity: [0.72, 1, 0.72] } : { opacity: 1 }}
      className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
      transition={{
        duration: 1.8,
        repeat: props.isActive ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      {props.label}
    </motion.span>
  );
}

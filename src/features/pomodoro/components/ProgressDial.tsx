import { motion } from 'motion/react';
import {
  progressCircumference,
  progressRadius,
} from '@/features/pomodoro/constants/pomodoro.constants';
import { formatTime } from '@/features/pomodoro/utils/pomodoro-timer.utils';

export function ProgressDial(props: {
  cyclesLabel: string;
  isActive: boolean;
  progressLabel: string;
  progressOffset: number;
  progressValue: number;
  remainingSeconds: number;
}) {
  return (
    <motion.div
      animate={props.isActive ? { scale: 1.03 } : { scale: 1 }}
      className="relative flex size-72 items-center justify-center sm:size-80"
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <progress
        className="sr-only"
        aria-label={props.progressLabel}
        max={100}
        value={props.progressValue}
      >
        {props.progressValue}%
      </progress>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 256 256" aria-hidden="true">
        <circle
          className="stroke-muted"
          cx="128"
          cy="128"
          fill="none"
          r={progressRadius}
          strokeWidth="10"
        />
        <motion.circle
          animate={
            props.isActive
              ? { opacity: [0.1, 0.38, 0.1], scale: [1, 1.03, 1] }
              : { opacity: 0, scale: 1 }
          }
          className="origin-center stroke-primary"
          cx="128"
          cy="128"
          fill="none"
          r={progressRadius}
          strokeLinecap="round"
          strokeWidth="14"
          transition={{
            duration: 2.4,
            repeat: props.isActive ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
        <motion.circle
          animate={{ strokeDashoffset: props.progressOffset }}
          className="stroke-primary drop-shadow-sm"
          cx="128"
          cy="128"
          fill="none"
          initial={false}
          r={progressRadius}
          strokeDasharray={progressCircumference}
          strokeLinecap="round"
          strokeWidth="10"
          transition={{ duration: 0.2, ease: 'linear' }}
        />
      </svg>
      <motion.div
        animate={props.isActive ? { opacity: [0.9, 1, 0.9] } : { opacity: 1 }}
        className="flex flex-col items-center"
        transition={{
          duration: 2.4,
          repeat: props.isActive ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        <output className="font-mono text-6xl font-semibold tracking-tight sm:text-7xl">
          {formatTime(props.remainingSeconds)}
        </output>
        <p className="mt-2 text-sm text-muted-foreground">{props.cyclesLabel}</p>
      </motion.div>
    </motion.div>
  );
}

import { progressCircumference } from '@/features/pomodoro/constants/pomodoro.constants';
import type { TimerMode } from '@/features/pomodoro/types/pomodoro-timer.types';

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getModeDuration(props: {
  breakMinutes: number;
  mode: TimerMode;
  workMinutes: number;
}) {
  return (props.mode === 'work' ? props.workMinutes : props.breakMinutes) * 60;
}

export function getProgressOffset(progressValue: number) {
  return progressCircumference * (1 - progressValue / 100);
}

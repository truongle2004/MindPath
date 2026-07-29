import { Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TimerStatus } from '@/features/pomodoro/types/pomodoro-timer.types';

export function TimerControls(props: {
  isSaving: boolean;
  onPause: () => void;
  onReset: () => void;
  onStart: () => void;
  pauseLabel: string;
  resetLabel: string;
  startLabel: string;
  status: TimerStatus;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {props.status === 'running' ? (
        <Button variant="outline" onClick={props.onPause}>
          <Pause data-icon="inline-start" />
          {props.pauseLabel}
        </Button>
      ) : (
        <Button onClick={props.onStart} disabled={props.isSaving}>
          <Play data-icon="inline-start" />
          {props.startLabel}
        </Button>
      )}
      <Button variant="outline" onClick={props.onReset} disabled={props.isSaving}>
        <RotateCcw data-icon="inline-start" />
        {props.resetLabel}
      </Button>
    </div>
  );
}

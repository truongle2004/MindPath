import { motion } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { maxFocusLabelLength } from '@/features/pomodoro/constants/pomodoro.constants';

export function TimerSettings(props: {
  breakLabel: string;
  breakMinutesInput: string;
  disabled: boolean;
  focusLabel: string;
  focusLabelText: string;
  focusPlaceholder: string;
  onBreakMinutesBlur: () => void;
  onBreakMinutesChange: (value: string) => void;
  onFocusLabelChange: (value: string) => void;
  onWorkMinutesBlur: () => void;
  onWorkMinutesChange: (value: string) => void;
  workLabel: string;
  workMinutesInput: string;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, height: 'auto' }}
      className="flex w-full max-w-sm flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card p-3 text-left shadow-sm"
      exit={{ opacity: 0, height: 0 }}
      initial={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pomodoro-focus-label" className="text-muted-foreground">
          {props.focusLabelText}
        </Label>
        <Input
          id="pomodoro-focus-label"
          type="text"
          className="bg-background"
          maxLength={maxFocusLabelLength}
          value={props.focusLabel}
          disabled={props.disabled}
          placeholder={props.focusPlaceholder}
          onChange={(event) => {
            props.onFocusLabelChange(event.currentTarget.value);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pomodoro-work-minutes" className="text-muted-foreground">
            {props.workLabel}
          </Label>
          <Input
            id="pomodoro-work-minutes"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="bg-background tabular-nums"
            value={props.workMinutesInput}
            disabled={props.disabled}
            onBlur={props.onWorkMinutesBlur}
            onChange={(event) => {
              props.onWorkMinutesChange(event.currentTarget.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pomodoro-break-minutes" className="text-muted-foreground">
            {props.breakLabel}
          </Label>
          <Input
            id="pomodoro-break-minutes"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="bg-background tabular-nums"
            value={props.breakMinutesInput}
            disabled={props.disabled}
            onBlur={props.onBreakMinutesBlur}
            onChange={(event) => {
              props.onBreakMinutesChange(event.currentTarget.value);
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

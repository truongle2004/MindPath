'use client';

import { Pause, Play, RotateCcw, Settings, Timer } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSidebar } from '@/components/ui/sidebar';
import {
  completePomodoroSession,
  createPomodoroSession,
} from '@/features/decks/services/decks.api';
import { cn } from '@/lib/utils';

const defaultWorkMinutes = 25;
const defaultBreakMinutes = 5;
const progressRadius = 112;
const progressCircumference = 2 * Math.PI * progressRadius;

type TimerMode = 'work' | 'break';
type TimerStatus = 'idle' | 'running' | 'paused' | 'saving' | 'completed';

type PomodoroTimerProps = {
  deckId?: string;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getModeDuration(props: { breakMinutes: number; mode: TimerMode; workMinutes: number }) {
  return (props.mode === 'work' ? props.workMinutes : props.breakMinutes) * 60;
}

function FocusGlow(props: { isActive: boolean }) {
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

function ModeBadge(props: { isActive: boolean; label: string }) {
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

function ProgressDial(props: {
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

function TimerControls(props: {
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

function TimerSettings(props: {
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
          maxLength={100}
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

export function PomodoroTimer(props: Readonly<PomodoroTimerProps>) {
  const t = useTranslations('StudyPage');
  const sidebar = useSidebar();
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [mode, setMode] = useState<TimerMode>('work');
  const [workMinutes, setWorkMinutes] = useState(defaultWorkMinutes);
  const [breakMinutes, setBreakMinutes] = useState(defaultBreakMinutes);
  const [focusLabel, setFocusLabel] = useState(t('pomodoro_focus_default'));
  const [workMinutesInput, setWorkMinutesInput] = useState(String(defaultWorkMinutes));
  const [breakMinutesInput, setBreakMinutesInput] = useState(String(defaultBreakMinutes));
  const [remainingSeconds, setRemainingSeconds] = useState(defaultWorkMinutes * 60);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [savedFocusMinutes, setSavedFocusMinutes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMountedRef = useRef(true);
  const isStartingSessionRef = useRef(false);
  const pendingSessionRequestRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const intervalId =
      status === 'running'
        ? window.setInterval(() => {
            setRemainingSeconds((current) => {
              if (current > 1) {
                return current - 1;
              }

              setMode((currentMode) => {
                if (currentMode === 'work') {
                  setCompletedCycles((count) => count + 1);
                  return 'break';
                }

                return 'work';
              });

              return getModeDuration({
                breakMinutes,
                mode: mode === 'work' ? 'break' : 'work',
                workMinutes,
              });
            });
          }, 1000)
        : null;

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [breakMinutes, mode, status, workMinutes]);

  function commitWorkMinutes() {
    const minutes = Number(workMinutesInput);

    if (!workMinutesInput.trim() || !Number.isFinite(minutes)) {
      setWorkMinutesInput(String(workMinutes));
      return workMinutes;
    }

    const nextMinutes = Math.min(Math.max(Math.trunc(minutes), 1), 180);
    setWorkMinutes(nextMinutes);
    setWorkMinutesInput(String(nextMinutes));

    if (status === 'idle' && mode === 'work') {
      setRemainingSeconds(nextMinutes * 60);
    }

    return nextMinutes;
  }

  function commitBreakMinutes() {
    const minutes = Number(breakMinutesInput);

    if (!breakMinutesInput.trim() || !Number.isFinite(minutes)) {
      setBreakMinutesInput(String(breakMinutes));
      return breakMinutes;
    }

    const nextMinutes = Math.min(Math.max(Math.trunc(minutes), 1), 60);
    setBreakMinutes(nextMinutes);
    setBreakMinutesInput(String(nextMinutes));

    if (status === 'idle' && mode === 'break') {
      setRemainingSeconds(nextMinutes * 60);
    }

    return nextMinutes;
  }

  async function handleStart() {
    setError(null);
    const nextWorkMinutes = commitWorkMinutes();
    const nextBreakMinutes = commitBreakMinutes();
    setIsSettingsOpen(false);
    sidebar.setOpen(false);
    sidebar.setOpenMobile(false);

    if (sessionId) {
      setStatus('running');
      return;
    }

    if (isStartingSessionRef.current) {
      setStatus('running');
      return;
    }

    const requestId = pendingSessionRequestRef.current + 1;
    pendingSessionRequestRef.current = requestId;
    isStartingSessionRef.current = true;
    setSessionId(null);
    setSavedFocusMinutes(null);
    setStatus('running');

    try {
      const trimmedFocusLabel = focusLabel.trim();
      const response = await createPomodoroSession({
        input: {
          ...(props.deckId ? { deckId: props.deckId } : {}),
          workMinutes: nextWorkMinutes,
          breakMinutes: nextBreakMinutes,
          focusLabel: trimmedFocusLabel || null,
        },
      });

      if (!isMountedRef.current || pendingSessionRequestRef.current !== requestId) {
        return;
      }

      isStartingSessionRef.current = false;
      setSessionId(response.session.id);
    } catch {
      if (!isMountedRef.current || pendingSessionRequestRef.current !== requestId) {
        return;
      }

      isStartingSessionRef.current = false;
      setStatus('idle');
      setError(t('pomodoro_start_error'));
    }
  }

  function handlePause() {
    setStatus('paused');
  }

  function handleReset() {
    pendingSessionRequestRef.current += 1;
    isStartingSessionRef.current = false;
    setStatus('idle');
    setMode('work');
    setRemainingSeconds(workMinutes * 60);
    setCompletedCycles(0);
    setSessionId(null);
    setSavedFocusMinutes(null);
    setError(null);
  }

  async function handleComplete() {
    if (!sessionId || completedCycles < 1) {
      return;
    }

    setStatus('saving');
    setError(null);

    try {
      const response = await completePomodoroSession({
        sessionId,
        input: { completedCycles },
      });

      if (!isMountedRef.current) {
        return;
      }

      setSavedFocusMinutes(response.focusMinutes);
      setStatus('completed');
    } catch {
      setStatus('paused');
      setError(t('pomodoro_complete_error'));
    }
  }

  const duration = getModeDuration({ breakMinutes, mode, workMinutes });
  const elapsedSeconds = duration - remainingSeconds;
  const progressValue = duration > 0 ? (elapsedSeconds / duration) * 100 : 0;
  const progressOffset = progressCircumference * (1 - progressValue / 100);
  const canComplete = completedCycles > 0 && Boolean(sessionId);
  const isFocusActive = ['running', 'paused', 'saving', 'completed'].includes(status);
  const modeLabel = mode === 'work' ? t('pomodoro_work_mode') : t('pomodoro_break_mode');
  const startLabel = status === 'paused' ? t('pomodoro_resume_button') : t('pomodoro_start_button');
  const footerHint = canComplete
    ? t('pomodoro_complete_hint')
    : t('pomodoro_complete_disabled_hint');
  const completeLabel =
    status === 'saving' ? t('pomodoro_saving_button') : t('pomodoro_complete_button');

  return (
    <motion.div layout transition={{ duration: 0.3, ease: 'easeOut' }}>
      <Card
        size="sm"
        className={cn(
          'relative bg-background transition-colors duration-300',
          isFocusActive && 'border-primary/20 ring-1 ring-primary/20',
        )}
      >
        <FocusGlow isActive={isFocusActive} />

        <CardHeader className={cn(isFocusActive && 'items-center text-center')}>
          <CardTitle className="flex items-center gap-2">
            <Timer className="size-4 text-muted-foreground" aria-hidden="true" />
            {t('pomodoro_title')}
          </CardTitle>
          <CardDescription>{t('pomodoro_description')}</CardDescription>
          <CardAction>
            <ModeBadge isActive={isFocusActive} label={modeLabel} />
          </CardAction>
        </CardHeader>

        <CardContent className={cn('flex flex-col gap-4', isFocusActive && 'py-8 sm:py-12')}>
          <div className="flex flex-col items-center gap-4 text-center">
            <ProgressDial
              cyclesLabel={t('pomodoro_cycles', { count: completedCycles })}
              isActive={isFocusActive}
              progressLabel={t('pomodoro_progress_label')}
              progressOffset={progressOffset}
              progressValue={progressValue}
              remainingSeconds={remainingSeconds}
            />
            <Button
              variant="ghost"
              onClick={() => {
                setIsSettingsOpen((current) => !current);
              }}
              aria-expanded={isSettingsOpen}
              aria-controls="pomodoro-settings"
            >
              <Settings data-icon="inline-start" />
              {t('pomodoro_settings_button')}
            </Button>
            <AnimatePresence initial={false}>
              {isSettingsOpen ? (
                <div id="pomodoro-settings" className="flex w-full justify-center">
                  <TimerSettings
                    breakLabel={t('pomodoro_break_minutes_label')}
                    breakMinutesInput={breakMinutesInput}
                    disabled={status !== 'idle'}
                    focusLabel={focusLabel}
                    focusLabelText={t('pomodoro_focus_label')}
                    focusPlaceholder={t('pomodoro_focus_placeholder')}
                    onBreakMinutesBlur={commitBreakMinutes}
                    onBreakMinutesChange={setBreakMinutesInput}
                    onFocusLabelChange={setFocusLabel}
                    onWorkMinutesBlur={commitWorkMinutes}
                    onWorkMinutesChange={setWorkMinutesInput}
                    workLabel={t('pomodoro_work_minutes_label')}
                    workMinutesInput={workMinutesInput}
                  />
                </div>
              ) : null}
            </AnimatePresence>
            <TimerControls
              isSaving={status === 'saving'}
              onPause={handlePause}
              onReset={handleReset}
              onStart={() => {
                void handleStart();
              }}
              pauseLabel={t('pomodoro_pause_button')}
              resetLabel={t('pomodoro_reset_button')}
              startLabel={startLabel}
              status={status}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {status === 'completed' && savedFocusMinutes !== null ? (
            <p className="text-sm text-muted-foreground">
              {t('pomodoro_saved_message', { count: savedFocusMinutes })}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-wrap justify-between gap-3">
          <p className="text-sm text-muted-foreground">{footerHint}</p>
          <Button
            variant="outline"
            onClick={() => {
              void handleComplete();
            }}
            disabled={!canComplete || status === 'saving' || status === 'completed'}
          >
            {completeLabel}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

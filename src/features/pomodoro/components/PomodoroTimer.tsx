'use client';

import { Settings, Timer } from 'lucide-react';
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
import { useSidebar } from '@/components/ui/sidebar';
import { FocusGlow } from '@/features/pomodoro/components/FocusGlow';
import { ModeBadge } from '@/features/pomodoro/components/ModeBadge';
import { ProgressDial } from '@/features/pomodoro/components/ProgressDial';
import { TimerControls } from '@/features/pomodoro/components/TimerControls';
import { TimerSettings } from '@/features/pomodoro/components/TimerSettings';
import {
  defaultBreakMinutes,
  defaultWorkMinutes,
  maxBreakMinutes,
  maxWorkMinutes,
  timerTickMs,
} from '@/features/pomodoro/constants/pomodoro.constants';
import { usePomodoroSessionMutations } from '@/features/pomodoro/hooks/usePomodoroSessionMutations';
import type {
  PomodoroTimerProps,
  TimerMode,
  TimerStatus,
} from '@/features/pomodoro/types/pomodoro-timer.types';
import { getModeDuration, getProgressOffset } from '@/features/pomodoro/utils/pomodoro-timer.utils';
import { cn } from '@/lib/utils';

export function PomodoroTimer(props: Readonly<PomodoroTimerProps>) {
  const t = useTranslations('StudyPage');
  const sidebar = useSidebar();
  const mutations = usePomodoroSessionMutations();
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
          }, timerTickMs)
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

    const nextMinutes = Math.min(Math.max(Math.trunc(minutes), 1), maxWorkMinutes);
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

    const nextMinutes = Math.min(Math.max(Math.trunc(minutes), 1), maxBreakMinutes);
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
      const response = await mutations.createSession.mutateAsync({
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
      const response = await mutations.completeSession.mutateAsync({
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
  const progressOffset = getProgressOffset(progressValue);
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

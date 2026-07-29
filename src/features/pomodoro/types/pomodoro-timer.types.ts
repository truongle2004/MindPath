export type TimerMode = 'work' | 'break';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'saving' | 'completed';

export type PomodoroTimerProps = {
  deckId?: string;
};

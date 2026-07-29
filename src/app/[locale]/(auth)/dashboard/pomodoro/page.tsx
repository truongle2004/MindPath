import { setRequestLocale } from 'next-intl/server';
import { PomodoroPageContent } from '@/features/pomodoro/components/PomodoroPageContent';

export default async function PomodoroPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PomodoroPageContent />
    </div>
  );
}

'use client';

import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const courseKeys = [
  { key: 'memory_lab', icon: Brain, tone: 'bg-chart-1/20 text-foreground' },
  { key: 'math_quest', icon: Target, tone: 'bg-chart-4 text-foreground' },
  {
    key: 'writing_studio',
    icon: BookOpen,
    tone: 'bg-secondary text-secondary-foreground',
  },
] as const;

const progressKeys = [
  {
    key: 'daily_streak',
    valueKey: 'progress_daily_streak_value',
    tone: 'bg-chart-1',
  },
  {
    key: 'weekly_focus',
    valueKey: 'progress_weekly_focus_value',
    tone: 'bg-primary',
  },
  {
    key: 'quiz_mastery',
    valueKey: 'progress_quiz_mastery_value',
    tone: 'bg-muted-foreground',
  },
] as const;

const testimonialKeys = ['maya', 'linh', 'noah'] as const;

const statKeys = ['courses', 'learners', 'minutes'] as const;

/**
 * About page content presenting the MindPath learning platform landing page.
 * @returns The marketing landing page content.
 */
export function AboutContent() {
  const t = useTranslations('AboutPage');

  return (
    <main className="bg-background">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit border border-border">
            <Sparkles aria-hidden="true" />
            {t('badge')}
          </Badge>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              {t('hero_title')}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              {t('hero_description')}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="shadow-md">
              <Link href="/sign-up">
                {t('cta_button')}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">{t('secondary_cta_button')}</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {statKeys.map((key) => (
              <div
                key={key}
                className="rounded-xl border-2 border-border bg-card px-4 py-3 shadow-sm"
              >
                <p className="text-2xl font-bold text-foreground">{t(`stat_${key}_value`)}</p>
                <p className="text-sm text-muted-foreground">{t(`stat_${key}_label`)}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-2 border-border bg-card shadow-[0_14px_0_var(--border)]">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{t('demo_title')}</CardTitle>
                <CardDescription>{t('demo_description')}</CardDescription>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap aria-hidden="true" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="rounded-xl border border-border bg-accent p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('demo_next_label')}
                  </p>
                  <p className="text-lg font-semibold text-foreground">{t('demo_next_title')}</p>
                </div>
                <Badge>{t('demo_next_badge')}</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {progressKeys.map((item) => (
                <div key={item.key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {t(`progress_${item.key}_label`)}
                    </span>
                    <span className="text-muted-foreground">{t(item.valueKey)}</span>
                  </div>
                  <div className="h-3 rounded-4xl bg-muted">
                    <div
                      className={cn('h-3 rounded-4xl', item.tone)}
                      style={{ width: t(`progress_${item.key}_width`) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-sm text-muted-foreground">{t('demo_footer')}</span>
            <Trophy aria-hidden="true" />
          </CardFooter>
        </Card>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12">
        <div className="flex flex-col gap-3 md:max-w-2xl">
          <Badge variant="outline" className="w-fit">
            {t('catalog_badge')}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t('catalog_title')}
          </h2>
          <p className="text-muted-foreground">{t('catalog_description')}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {courseKeys.map((course) => {
            const Icon = course.icon;

            return (
              <Card
                key={course.key}
                className="border-2 border-border bg-card shadow-[0_10px_0_var(--border)]"
              >
                <CardHeader>
                  <div
                    className={cn(
                      'flex size-12 items-center justify-center rounded-xl border border-border',
                      course.tone,
                    )}
                  >
                    <Icon aria-hidden="true" />
                  </div>
                  <CardTitle>{t(`course_${course.key}_title`)}</CardTitle>
                  <CardDescription>{t(`course_${course.key}_description`)}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{t(`course_${course.key}_level`)}</Badge>
                  <Badge variant="outline">{t(`course_${course.key}_duration`)}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-2 border-border bg-primary text-primary-foreground shadow-[0_10px_0_var(--muted)]">
          <CardHeader>
            <CardTitle className="text-2xl">{t('tracking_title')}</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {t('tracking_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-primary-foreground/10 p-4">
              <Clock3 aria-hidden="true" />
              <p className="mt-3 text-xl font-semibold">{t('tracking_focus_value')}</p>
              <p className="text-sm text-primary-foreground/75">{t('tracking_focus_label')}</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 p-4">
              <CheckCircle2 aria-hidden="true" />
              <p className="mt-3 text-xl font-semibold">{t('tracking_goal_value')}</p>
              <p className="text-sm text-primary-foreground/75">{t('tracking_goal_label')}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonialKeys.map((key) => (
            <Card key={key} className="border-2 border-border bg-card shadow-md">
              <CardHeader>
                <div className="flex gap-1 text-chart-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`${key}-${index}`} aria-hidden="true" className="fill-current" />
                  ))}
                </div>
                <CardTitle>{t(`testimonial_${key}_name`)}</CardTitle>
                <CardDescription>{t(`testimonial_${key}_role`)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t(`testimonial_${key}_quote`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 pb-20">
        <Card className="border-2 border-border bg-secondary shadow-[0_12px_0_var(--border)]">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div className="flex flex-col gap-3">
              <Badge className="w-fit">{t('enrollment_badge')}</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-secondary-foreground">
                {t('enrollment_title')}
              </h2>
              <p className="max-w-2xl text-secondary-foreground/75">
                {t('enrollment_description')}
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/sign-up">
                {t('enrollment_button')}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

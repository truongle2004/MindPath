import { Brain, Repeat, Layers, Target } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: AboutPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  // const t = await getTranslations({
  //   locale,
  //   namespace: "About",
  // });

  const methods = [
    {
      icon: Repeat,
      title: 'Spaced repetition',
      description:
        "Reviews are scheduled right before you're about to forget, so material moves into long-term memory with far less time spent.",
    },
    {
      icon: Brain,
      title: 'Active recall',
      description:
        "Instead of re-reading notes, you're prompted to retrieve answers from memory — proven to build stronger, faster recall.",
    },
    {
      icon: Layers,
      title: 'Interleaving',
      description:
        'Topics are mixed rather than studied in isolated blocks, helping you tell concepts apart and apply them flexibly.',
    },
    {
      icon: Target,
      title: 'Deliberate practice',
      description:
        "Sessions target your specific weak spots, with immediate feedback so effort goes exactly where it's needed.",
    },
  ];

  // const values = [
  //   {
  //     icon: Compass,
  //     title: t("value_clarity_title"),
  //     description: t("value_clarity_description"),
  //   },
  //   {
  //     icon: TrendingUp,
  //     title: t("value_growth_title"),
  //     description: t("value_growth_description"),
  //   },
  //   {
  //     icon: HeartHandshake,
  //     title: t("value_support_title"),
  //     description: t("value_support_description"),
  //   },
  // ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {/* Hero */}
      <section className="space-y-4 text-center">
        <Badge variant="secondary">About our approach</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">
          Learning methods backed by cognitive science
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          We built this platform around decades of research on how memory actually works, not just
          what feels productive in the moment.
        </p>
      </section>

      <Separator className="my-12" />

      {/* Methods grid */}
      <section>
        <h2 className="mb-6 text-center text-2xl font-semibold">The methods we use</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {methods.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* Why it works */}
      <section className="grid items-start gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-2xl font-semibold">Why it works</h2>
          <p className="leading-relaxed text-muted-foreground">
            Most studying feels productive but doesn't stick, because re-reading and highlighting
            create a false sense of familiarity. Retrieval-based methods feel harder in the moment,
            but that difficulty is exactly what builds durable memory.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Research-backed results</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">2x</p>
              <p className="text-xs text-muted-foreground">Retention rate</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">40%</p>
              <p className="text-xs text-muted-foreground">Less study time</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">90+</p>
              <p className="text-xs text-muted-foreground">Studies cited</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      {/* CTA */}
      <section className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold">Ready to study smarter?</h2>
        <p className="text-muted-foreground">
          Start a session today and see how these methods feel in practice.
        </p>
        <Button size="lg">Get started</Button>
      </section>
    </main>
  );
}

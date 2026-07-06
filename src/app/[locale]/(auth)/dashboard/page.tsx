import { setRequestLocale } from "next-intl/server";
import { DashboardHomeContent } from "@/components/DashboardHomeContent";

export default async function DashboardPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHomeContent />
    </div>
  );
}

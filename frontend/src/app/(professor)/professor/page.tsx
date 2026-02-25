import type { Metadata } from "next";
import { cookies } from "next/headers";
import ProfessorDashboard from "@/features/professor/main/components/ProfessorDashboard";
import { getMessages } from "@/i18n/messages";
import { DEFAULT_LOCALE, LOCALE_COOKIE_KEY, isLocale } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const localeCookie = cookies().get(LOCALE_COOKIE_KEY)?.value;
  const locale = isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;
  const t = getMessages(locale).mypage.professor.metadata;
  return {
    title: t.title,
    description: t.description,
  };
}

export default function ProfessorPage() {
  return <ProfessorDashboard />;
}

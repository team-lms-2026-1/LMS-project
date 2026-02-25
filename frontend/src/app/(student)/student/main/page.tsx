import type { Metadata } from "next";
import { cookies } from "next/headers";
import MypageContainer from "@/features/student/mypage/components/MypageContainer";
import { getMessages } from "@/i18n/messages";
import { DEFAULT_LOCALE, LOCALE_COOKIE_KEY, isLocale } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const localeCookie = cookies().get(LOCALE_COOKIE_KEY)?.value;
  const locale = isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;
  const t = getMessages(locale).mypage.student.metadata;
  return {
    title: t.title,
    description: t.description,
  };
}

export default function StudentHome() {
  return <MypageContainer />;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import styles from "./student-shell.module.css";

type NavItem = { labelKey: string; href: string };
type NavSection = { key: string; titleKey: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    key: "community",
    titleKey: "sections.community.title",
    items: [
      { labelKey: "sections.community.items.notices", href: "/student/community/notices" },
      { labelKey: "sections.community.items.resources", href: "/student/community/resources" },
      { labelKey: "sections.community.items.faqs", href: "/student/community/faqs" },
      { labelKey: "sections.community.items.qna", href: "/student/community/qna/questions" },
    ],
  },
  {
    key: "course",
    titleKey: "sections.course.title",
    items: [
      { labelKey: "sections.course.items.offerings", href: "/student/curricular/offerings" },
      { labelKey: "sections.course.items.enrollments", href: "/student/curricular/enrollments" },
      { labelKey: "sections.course.items.currentEnrollments", href: "/student/curricular/current-enrollments" },
      { labelKey: "sections.course.items.gradeReports", href: "/student/curricular/grade-reports" },
    ],
  },
  {
    key: "extra",
    titleKey: "sections.extra.title",
    items: [
      { labelKey: "sections.extra.items.offerings", href: "/student/extra-curricular/offerings" },
      { labelKey: "sections.extra.items.enrollments", href: "/student/extra-curricular/enrollments" },
      { labelKey: "sections.extra.items.currentEnrollments", href: "/student/extra-curricular/current-enrollments" },
      { labelKey: "sections.extra.items.gradeReports", href: "/student/extra-curricular/grade-reports" },
    ],
  },
  {
    key: "mentoring",
    titleKey: "sections.mentoring.title",
    items: [
      { labelKey: "sections.mentoring.items.apply", href: "/student/mentoring/apply" },
      { labelKey: "sections.mentoring.items.chat", href: "/student/mentoring/chat" },
    ],
  },
  {
    key: "competency",
    titleKey: "sections.competency.title",
    items: [
      { labelKey: "sections.competency.items.introduce", href: "/student/competencies/introduce" },
      { labelKey: "sections.competency.items.diagnosis", href: "/student/competencies/dignosis" },
      { labelKey: "sections.competency.items.result", href: "/student/competencies/result" },
    ],
  },
  {
    key: "survey",
    titleKey: "sections.survey.title",
    items: [{ labelKey: "sections.survey.items.list", href: "/student/surveys" }],
  },
  {
    key: "space",
    titleKey: "sections.space.title",
    items: [
      { labelKey: "sections.space.items.spaces", href: "/student/study-space/spaces" },
      { labelKey: "sections.space.items.rentals", href: "/student/study-space/spaces-rentals" },
    ],
  },
  {
    key: "aiAdvisor",
    titleKey: "sections.aiAdvisor.title",
    items: [{ labelKey: "sections.aiAdvisor.items.mbti", href: "/student/mbti" }],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function StudentSidebar() {
  const pathname = usePathname();
  const t = useI18n("menu.student");
  const tCommon = useI18n("menu.common");
  const [hoverOpenKey, setHoverOpenKey] = useState<string | null>(null);

  const activeSectionKey = useMemo(() => {
    for (const section of SECTIONS) {
      if (section.items.some((item) => isActive(pathname, item.href))) return section.key;
    }
    return null;
  }, [pathname]);

  return (
    <div className={styles.sidebarInner}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>{tCommon("sidebarTitle")}</div>
        <Link href="/student/main" className={styles.headerLogoLink}>
          <img src="/logo.png" alt={tCommon("logoAlt.student")} className={styles.headerLogoImage} />
        </Link>
      </div>

      <div className={styles.sectionList}>
        {SECTIONS.map((section) => {
          const open = hoverOpenKey === section.key;

          return (
            <div
              key={section.key}
              className={styles.section}
              data-open={open ? "true" : "false"}
              onMouseEnter={() => setHoverOpenKey(section.key)}
              onMouseLeave={() => setHoverOpenKey(null)}
            >
              <div
                className={[
                  styles.sectionHeader,
                  activeSectionKey === section.key ? styles.sectionHeaderActive : "",
                  open ? styles.sectionHeaderOpen : "",
                ].join(" ")}
                aria-expanded={open}
              >
                <span className={styles.sectionHeaderText}>{t(section.titleKey)}</span>
                <span className={open ? styles.chevUp : styles.chevDown} aria-hidden="true" />
              </div>

              {open && (
                <div className={styles.sectionBody}>
                  {section.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href + item.labelKey}
                        href={item.href}
                        className={active ? styles.itemActive : styles.item}
                      >
                        {t(item.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

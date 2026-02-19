"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import styles from "./admin-shell.module.css";

type NavItem = { labelKey: string; href: string; exact?: boolean };
type NavSection = { key: string; titleKey: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    key: "community",
    titleKey: "sections.community.title",
    items: [
      { labelKey: "sections.community.items.notices", href: "/admin/community/notices" },
      { labelKey: "sections.community.items.resources", href: "/admin/community/resources" },
      { labelKey: "sections.community.items.faqs", href: "/admin/community/faqs" },
      { labelKey: "sections.community.items.qna", href: "/admin/community/qna" },
    ],
  },
  {
    key: "authority",
    titleKey: "sections.authority.title",
    items: [
      { labelKey: "sections.authority.items.departments", href: "/admin/authority/departments" },
      { labelKey: "sections.authority.items.accounts", href: "/admin/authority/accounts" },
      { labelKey: "sections.authority.items.semesters", href: "/admin/authority/semesters" },
    ],
  },
  {
    key: "system-status",
    titleKey: "sections.systemStatus.title",
    items: [{ labelKey: "sections.systemStatus.items.accountLogs", href: "/admin/system-status/account-logs" }],
  },
  {
    key: "survey",
    titleKey: "sections.survey.title",
    items: [
      { labelKey: "sections.survey.items.surveys", href: "/admin/surveys" },
      { labelKey: "sections.survey.items.statistics", href: "/admin/survey-results" },
    ],
  },
  {
    key: "competency",
    titleKey: "sections.competency.title",
    items: [
      { labelKey: "sections.competency.items.intro", href: "/admin/competencies", exact: true },
      { labelKey: "sections.competency.items.students", href: "/admin/competencies/students" },
      { labelKey: "sections.competency.items.diagnosis", href: "/admin/competencies/dignosis" },
    ],
  },
  {
    key: "course",
    titleKey: "sections.course.title",
    items: [
      { labelKey: "sections.course.items.curriculars", href: "/admin/curricular/curriculars" },
      { labelKey: "sections.course.items.offerings", href: "/admin/curricular/offerings" },
      { labelKey: "sections.course.items.grades", href: "/admin/curricular/grade-reports" },
    ],
  },
  {
    key: "extra",
    titleKey: "sections.extra.title",
    items: [
      { labelKey: "sections.extra.items.programs", href: "/admin/extra-curricular/extra-curriculars" },
      { labelKey: "sections.extra.items.offerings", href: "/admin/extra-curricular/offerings" },
      { labelKey: "sections.extra.items.grades", href: "/admin/extra-curricular/grade-reports" },
    ],
  },
  {
    key: "mentoring",
    titleKey: "sections.mentoring.title",
    items: [
      { labelKey: "sections.mentoring.items.recruitments", href: "/admin/mentoring/recruitments" },
      { labelKey: "sections.mentoring.items.applications", href: "/admin/mentoring/applications" },
      { labelKey: "sections.mentoring.items.matching", href: "/admin/mentoring/matching" },
    ],
  },
  {
    key: "space",
    titleKey: "sections.space.title",
    items: [
      { labelKey: "sections.space.items.spaces", href: "/admin/study-space/spaces" },
      { labelKey: "sections.space.items.rentals", href: "/admin/study-space/spaces-rentals" },
    ],
  },
];

function isActive(pathname: string, href: string, exact: boolean = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const t = useI18n("menu.admin");
  const tCommon = useI18n("menu.common");

  const [hoverOpenKey, setHoverOpenKey] = useState<string | null>(null);

  const activeSectionKey = useMemo(() => {
    for (const s of SECTIONS) {
      if (s.items.some((it) => isActive(pathname, it.href, it.exact))) return s.key;
    }
    return null;
  }, [pathname]);

  return (
    <div className={styles.sidebarInner}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>{tCommon("sidebarTitle")}</div>
        <Link href="/admin" className={styles.headerLogoLink}>
          <img
            src="/logo.png"
            alt={tCommon("logoAlt.admin")}
            className={styles.headerLogoImage}
          />
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
                    const active = isActive(pathname, item.href, item.exact);

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

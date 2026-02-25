"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import styles from "./professor-shell.module.css";

type NavItem = { labelKey: string; href: string };
type NavSection = { key: string; titleKey: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    key: "community",
    titleKey: "sections.community.title",
    items: [
      { labelKey: "sections.community.items.notices", href: "/professor/community/notices" },
      { labelKey: "sections.community.items.resources", href: "/professor/community/resources" },
      { labelKey: "sections.community.items.faqs", href: "/professor/community/faqs" },
      { labelKey: "sections.community.items.qna", href: "/professor/community/qna" },
    ],
  },
  {
    key: "course",
    titleKey: "sections.course.title",
    items: [{ labelKey: "sections.course.items.offerings", href: "/professor/curricular/offerings" }],
  },
  {
    key: "mentoring",
    titleKey: "sections.mentoring.title",
    items: [
      { labelKey: "sections.mentoring.items.apply", href: "/professor/mentoring/apply" },
      { labelKey: "sections.mentoring.items.chat", href: "/professor/mentoring/chat" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function ProfessorSidebar() {
  const pathname = usePathname();
  const t = useI18n("menu.professor");
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
        <Link href="/professor" className={styles.headerLogoLink}>
          <img src="/logo.png" alt={tCommon("logoAlt.professor")} className={styles.headerLogoImage} />
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

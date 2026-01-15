"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./admin-shell.module.css";

type NavItem = { label: string; href: string };
type NavSection = { key: string; title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    key: "community",
    title: "커뮤니티",
    items: [
      { label: "공지사항", href: "/community/notices" },
      { label: "자료실", href: "/community/resources" }, 
      { label: "FAQ", href: "/community/faq" }, 
      { label: "Q&A", href: "/community/qna" }, 
    ],
  },
  {
    key: "auth",
    title: "권한 관리",
    items: [{ label: "권한/역할", href: "/competencies" }], // 예시
  },
  {
    key: "system",
    title: "시스템환경 관리",
    items: [{ label: "코드 관리", href: "/surveys" }], // 예시
  },
  {
    key: "survey",
    title: "설문 통합 관리",
    items: [{ label: "설문 목록", href: "/surveys" }],
  },
  {
    key: "personal",
    title: "개인정보 조회",
    items: [{ label: "조회", href: "/competencies" }], // 예시
  },
  {
    key: "competency",
    title: "역량 통합 관리",
    items: [{ label: "6Cs 대시보드", href: "/competencies" }],
  },
  {
    key: "course",
    title: "교과 관리",
    items: [{ label: "교과 목록", href: "/surveys" }], // 예시
  },
  {
    key: "mentoring",
    title: "멘토링",
    items: [{ label: "멘토링 관리", href: "/competencies" }], // 예시
  },
  {
    key: "extra",
    title: "비교과 관리",
    items: [{ label: "비교과 프로그램", href: "/surveys" }], // 예시
  },
  {
    key: "selfextra",
    title: "자율 비교과 관리",
    items: [{ label: "자율 비교과", href: "/competencies" }], // 예시
  },
  {
    key: "career",
    title: "진로 설계",
    items: [{ label: "진로 설계", href: "/surveys" }], // 예시
  },
  {
    key: "job",
    title: "취업 지원 서비스",
    items: [{ label: "지원 서비스", href: "/competencies" }], // 예시
  },
  {
    key: "counsel",
    title: "상담 관리",
    items: [{ label: "상담 이력", href: "/surveys" }], // 예시
  },
  {
    key: "space",
    title: "학습 공간 대여",
    items: [{ label: "대여 현황", href: "/competencies" }], // 예시
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminSidebar() {
  const pathname = usePathname();

  // 열린 섹션 key 목록
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // 현재 경로가 속한 섹션은 기본으로 열리게
  const defaultOpen = useMemo(() => {
    for (const s of SECTIONS) {
      if (s.items.some((it) => isActive(pathname, it.href))) return s.key;
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    const raw = window.localStorage.getItem("admin.sidebar.openKeys");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setOpenKeys(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (defaultOpen && !openKeys.includes(defaultOpen)) {
      const next = [...openKeys, defaultOpen];
      setOpenKeys(next);
      window.localStorage.setItem("admin.sidebar.openKeys", JSON.stringify(next));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultOpen]);

  function toggleSection(key: string) {
    setOpenKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      window.localStorage.setItem("admin.sidebar.openKeys", JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className={styles.sidebarInner}>
      <div className={styles.sidebarTitle}>상세 메뉴</div>

      <div className={styles.sectionList}>
        {SECTIONS.map((section) => {
          const open = openKeys.includes(section.key);

          return (
            <div key={section.key} className={styles.section}>
              <button
                type="button"
                className={styles.sectionHeader}
                onClick={() => toggleSection(section.key)}
                aria-expanded={open}
              >
                <span className={styles.sectionHeaderText}>{section.title}</span>
                <span className={open ? styles.chevUp : styles.chevDown} aria-hidden="true" />
              </button>

              {open && (
                <div className={styles.sectionBody}>
                  {section.items.map((item) => {
                    const active = isActive(pathname, item.href);

                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        className={active ? styles.itemActive : styles.item}
                      >
                        {item.label}
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

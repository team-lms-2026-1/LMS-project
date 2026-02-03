"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./admin-shell.module.css";

type NavItem = { label: string; href: string };
type NavSection = { key: string; title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    key: "community",
    title: "커뮤니티",
    items: [
      { label: "공지사항", href: "/admin/community/notices" },
      { label: "자료실", href: "/admin/community/resources" },
      { label: "FAQ", href: "/admin/community/faq" },
      { label: "Q&A", href: "/admin/community/qna" },
    ],
  },
  {
    key: "authority",
    title: "권한 관리",
    items: [
      { label: "학과관리", href: "/admin/depts" },
      { label: "계정관리", href: "/admin/authority/accounts" },
      { label: "학기관리", href: "/admin/authority/semesters" },
    ],
  },
  {
    key: "system-status",
    title: "시스템환경 관리",
    items: [{ label: "계정로그관리", href: "/asmin/system-status" }],
  },
  {
    key: "survey",
    title: "설문 통합 관리",
    items: [
      { label: "설문 목록", href: "/admin/surveys" },
      { label: "설문 통계", href: "/admin/survey-results" },
    ],
  },
  {
    key: "personal",
    title: "개인정보 조회",
    items: [{ label: "조회", href: "/competencies" }],
  },
  {
    key: "competency",
    title: "역량 통합 관리",
    items: [{ label: "6Cs 대시보드", href: "/competencies" }],
  },
  {
    key: "course",
    title: "교과 관리",
    items: [
      { label: "교과 관리", href: "/admin/curricular/curriculars" },
      { label: "교과운영 관리", href: "/admin/curricular/offerings" },
      { label: "교과성적 관리", href: "/admin/curricular/grade-reports" },
    ],
  },
  {
    key: "mentoring",
    title: "멘토링",
    items: [{ label: "멘토링 관리", href: "/competencies" }],
  },
  {
    key: "extra",
    title: "비교과 관리",
    items: [{ label: "비교과 프로그램", href: "/surveys" }],
  },
  {
    key: "counsel",
    title: "상담 관리",
    items: [{ label: "상담 이력", href: "/surveys" }],
  },
  {
    key: "space",
    title: "학습 공간 대여",
    items: [{ label: "대여 현황", href: "/competencies" }],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminSidebar() {
  const pathname = usePathname();

  /**
   * ✅ hover로만 열리는 섹션
   * - null이면 전부 닫힘
   * - 어떤 섹션 위에 마우스가 올라가면 그 섹션 key로 설정
   * - 섹션 영역 밖으로 나가면 null로 닫힘
   */
  const [hoverOpenKey, setHoverOpenKey] = useState<string | null>(null);

  /**
   * ✅ 현재 경로가 속한 섹션(활성 표시용)
   * - "자동 오픈"이 아니라 "헤더 active 스타일 표시" 목적
   */
  const activeSectionKey = useMemo(() => {
    for (const s of SECTIONS) {
      if (s.items.some((it) => isActive(pathname, it.href))) return s.key;
    }
    return null;
  }, [pathname]);

  return (
    <div className={styles.sidebarInner}>
      <div className={styles.sidebarTitle}>상세 메뉴</div>

      <div className={styles.sectionList}>
        {SECTIONS.map((section) => {
          const open = hoverOpenKey === section.key;

          return (
            /**
             * ✅ wrapper에 enter/leave를 걸어야
             * - 헤더 -> 서브메뉴로 이동할 때 닫히지 않습니다.
             * - 서브메뉴 위에 있어도 "열림 상태 유지"가 됩니다.
             */
            <div
              key={section.key}
              className={styles.section}
              data-open={open ? "true" : "false"}
              onMouseEnter={() => setHoverOpenKey(section.key)}
              onMouseLeave={() => setHoverOpenKey(null)}
            >
              {/* ✅ 버튼은 클릭 토글 용도가 아니라 "헤더 UI" 용도 */}
              <div
                className={[
                  styles.sectionHeader,
                  activeSectionKey === section.key ? styles.sectionHeaderActive : "",
                  open ? styles.sectionHeaderOpen : "",
                ].join(" ")}
                aria-expanded={open}
              >
                <span className={styles.sectionHeaderText}>{section.title}</span>
                <span className={open ? styles.chevUp : styles.chevDown} aria-hidden="true" />
              </div>


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
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./student-shell.module.css";

type NavItem = { label: string; href: string };
type NavSection = { key: string; title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    key: "community",
    title: "커뮤니티",
    items: [
      { label: "공지사항", href: "/student/community/notices" },
      { label: "자료실", href: "/student/community/resources" },
      { label: "FAQ", href: "/student/community/faqs" },
      { label: "Q&A", href: "/student/community/qna/questions" },
    ],
  },
  {
    key: "mypage",
    title: "마이페이지",
    items: [{ label: "마이 캘린더", href: "/student/mypage/calendar" }],
  },
  {
    key: "course",
    title: "교과",
    items: [
      { label: "이수 신청", href: "/student/curricular/offerings" },
      { label: "이수 신청현황", href: "/student/curricular/enrollments" },
      { label: "이수중 교과", href: "/student/curricular/current-enrollments" },
      { label: "교과 성적", href: "/student/curricular/grade-reports" },
    ],
  },
  {
    key: "extra",
    title: "비교과",
    items: [
      { label: "비교과 프로그램 신청", href: "/student/extra-curricular/offerings" },
      { label: "비교과 목록 조회", href: "/student/extra" },
      { label: "비교과 수료 항목", href: "/student/extra/completions" },
    ],
  },
  {
    key: "mentoring",
    title: "멘토링",
    items: [
      { label: "멘티 신청", href: "/student/mentoring/apply" },
      { label: "멘토링 채팅", href: "/student/mentoring/chat" },
    ],
  },
  {
    key: "competency",
    title: "역량진단",
    items: [
      { label: "안내", href: "/student/competency/guide" },
      { label: "진단목록", href: "/student/competency" },
      { label: "결과 조회", href: "/student/competency/results" },
    ],
  },
  {
    key: "survey",
    title: "설문",
    items: [
      { label: "설문 목록", href: "/student/surveys" },
    ],
  },
  {
    key: "space",
    title: "학습공간대여",
    items: [
      { label: "학습공간대여 및 신청", href: "/student/study-space/spaces" },
      { label: "신청내역확인", href: "/student/study-space/spaces-rentals" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function StudentSidebar() {
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./professor-shell.module.css";

type NavItem = { label: string; href: string };
type NavSection = { key: string; title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
    {
        key: "community",
        title: "커뮤니티",
        items: [
            { label: "공지사항", href: "/professor/community/notices" },
            { label: "자료실", href: "/professor/community/resources" },
            { label: "FAQ", href: "/professor/community/faqs" },
            { label: "Q&A", href: "/professor/community/qna" },
        ],
    },
    {
        key: "competency",
        title: "역량 관리",
        items: [
            { label: "역량 조회", href: "/professor/competencies" },
        ],
    },
    {
        key: "course",
        title: "교과 관리",
        items: [
            { label: "내 강의 목록", href: "/professor/courses" },
            { label: "강의 계획서", href: "/professor/syllabus" },
            { label: "성적 입력", href: "/professor/grades" },
            { label: "출석 관리", href: "/professor/attendance" },
        ],
    },
    {
        key: "mentoring",
        title: "멘토링",
        items: [
            { label: "멘토 신청", href: "/professor/mentoring/apply" },
            { label: "멘토링 채팅", href: "/professor/mentoring/chat" },
        ],
    },
];

function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(href + "/");
}

export default function ProfessorSidebar() {
    const pathname = usePathname();
    const [hoverOpenKey, setHoverOpenKey] = useState<string | null>(null);

    const activeSectionKey = useMemo(() => {
        for (const s of SECTIONS) {
            if (s.items.some((it) => isActive(pathname, it.href))) return s.key;
        }
        return null;
    }, [pathname]);

    return (
        <div className={styles.sidebarInner}>
            <div className={styles.sidebarTitle}>교수 메뉴</div>

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

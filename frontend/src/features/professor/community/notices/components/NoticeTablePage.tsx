"use client";

import { Table, type TableColumn } from "@/components/table";
import { NoticeListItemDto } from "../api/types";
import styles from "./NoticeTable.module.css";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    items: NoticeListItemDto[];
    loading: boolean;
    onEditClick: (id: number) => void;
};

export function NoticesTable({ items, loading, onEditClick }: Props) {
    const router = useRouter();
    const t = useI18n("community.notices.professor.table");
    const columns: Array<TableColumn<NoticeListItemDto>> = [
        { header: t("headers.id"), align: "left", render: (r) => r.noticeId },
        {
            header: t("headers.category"), align: "left", render: (r) => {
                const c = r.category;
                if (!c) return t("uncategorized");
                return (
                    <span
                        className={styles.badge}
                        style={{ backgroundColor: c.bgColorHex, color: c.textColorHex }}
                    >{c.name}</span>
                );
            },
        },
        {
            header: t("headers.title"),
            align: "center",
            render: (r) => (
                <button
                    type="button"
                    className={styles.titleLink}
                    // 교수용 경로로 수정
                    onClick={() => router.push(`/professor/community/notices/${r.noticeId}`)}
                >
                    {r.title}
                </button>
            ),
        },
        { header: t("headers.views"), align: "center", render: (r) => r.viewCount },
        { header: t("headers.createdAt"), align: "center", render: (r) => r.createdAt },
    ];

    return (
        <Table<NoticeListItemDto>
            columns={columns}
            items={items}
            loading={loading}
            skeletonRowCount={10}
            rowKey={(r) => r.noticeId}
            emptyText={t("emptyText")}
        />
    );
}

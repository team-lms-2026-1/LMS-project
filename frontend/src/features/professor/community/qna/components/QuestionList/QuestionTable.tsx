"use client";

import { Table, type TableColumn } from "@/components/table";
import { QnaListItemDto } from "../../api/types";
import styles from "./QuestionTable.module.css";
import { useRouter } from "next/navigation";

type Props = {
    items: QnaListItemDto[];
    loading: boolean;
};

export function QuestionTable({ items, loading }: Props) {
    const router = useRouter();
    const columns: Array<TableColumn<QnaListItemDto>> = [
        { header: "번호", align: "left", render: (r) => r.questionId },
        {
            header: "분류", align: "left", render: (r) => {
                const c = r.category;
                if (!c) return "미분류";
                return (
                    <span
                        className={styles.badge}
                        style={{ backgroundColor: c.bgColorHex, color: c.textColorHex }}
                    >{c.name}</span>
                );
            },
        },
        {
            header: "제목",
            align: "center",
            render: (r) => (
                <button
                    type="button"
                    className={styles.titleLink}
                    onClick={() => router.push(`/professor/community/qna/${r.questionId}`)}
                >
                    {r.title}
                </button>
            ),
        },
        { header: "작성자", align: "center", render: (r) => r.authorName },
        { header: "답변여부", align: "center", render: (r) => r.hasAnswer ? "답변완료" : "대기중" },
        { header: "조회수", align: "center", render: (r) => r.viewCount },
        { header: "작성일", align: "center", render: (r) => r.createdAt },
    ];

    return (
        <Table<QnaListItemDto>
            columns={columns}
            items={items}
            loading={loading}
            skeletonRowCount={10}
            rowKey={(r) => r.questionId}
            emptyText="등록된 질문이 없습니다."
        />
    );
}

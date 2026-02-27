import React, { useEffect, useState, useMemo } from "react";
import styles from "./TargetListModal.module.css";
import { fetchSurveyParticipants } from "../../api/surveysApi";
import { SurveyParticipantDto } from "../../api/types";
import { useI18n } from "@/i18n/useI18n";
import toast from "react-hot-toast";
import { Modal } from "@/components/modal/Modal";
import { Table } from "@/components/table/Table";
import { Button } from "@/components/button";
import type { TableColumn } from "@/components/table/types";

interface TargetListModalProps {
    surveyId: number;
    status: "ALL" | "SUBMITTED" | "PENDING";
    onClose: () => void;
}

export function TargetListModal({ surveyId, status, onClose }: TargetListModalProps) {
    const t = useI18n("survey.admin.stats.participants");
    const [participants, setParticipants] = useState<SurveyParticipantDto[]>([]);
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadData = async (pageNum: number) => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const apiStatus = status === "ALL" ? undefined : status;
            const res = await fetchSurveyParticipants(surveyId, pageNum, 20, apiStatus);
            if (res.data.length < 20) {
                setHasMore(false);
            }
            if (pageNum === 1) {
                setParticipants(res.data);
            } else {
                setParticipants(prev => [...prev, ...res.data]);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t("errorLoad"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(page);
    }, [page]);

    const title = status === "ALL"
        ? t("modalTitleTargets")
        : status === "SUBMITTED"
            ? t("modalTitleSubmitters")
            : t("modalTitlePending");

    const columns = useMemo<TableColumn<SurveyParticipantDto>[]>(() => [
        {
            header: t("headers.dept"),
            field: "deptName",
            width: "140px",
        },
        {
            header: t("headers.grade"),
            field: "gradeLevel",
            width: "80px",
            align: "center",
            render: (row) => row.gradeLevel ? String(row.gradeLevel) : "-"
        },
        {
            header: t("headers.name"),
            field: "name",
            width: "120px",
        }
    ], [t]);

    return (
        <Modal
            open={true}
            title={title}
            onClose={onClose}
            size="md"
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={onClose}>
                        {t("closeButton")}
                    </Button>
                </div>
            }
        >
            <div
                className={styles.content}
                onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50 && hasMore && !loading) {
                        setPage(p => p + 1);
                    }
                }}
            >
                <Table
                    columns={columns}
                    items={participants}
                    rowKey={(row) => row.targetId}
                    loading={loading && page === 1}
                    emptyText={t("empty")}
                />

                {loading && page > 1 && <div className={styles.loading}>Loading...</div>}
            </div>
        </Modal>
    );
}

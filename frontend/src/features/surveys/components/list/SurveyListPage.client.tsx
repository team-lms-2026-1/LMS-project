"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./SurveyListPage.client.module.css";
import { SurveysTable } from "./SurveysTable";
import { Button } from "@/components/button";
import { useSurveyList } from "../../hooks/useSurveyList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { deleteSurvey, fetchSurveyTypes } from "../../api/surveysApi";
import { SurveyTypeResponse } from "../../api/types";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/modal";
import { useRouter } from "next/navigation";

export default function SurveyListPageClient() {
    const router = useRouter();
    const { state, actions } = useSurveyList();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { page, size, keyword, setPage, setKeyword } = useListQuery({
        defaultPage: 1,
        defaultSize: 10
    });

    const [inputKeyword, setInputKeyword] = useState(keyword || "");
    const [types, setTypes] = useState<SurveyTypeResponse[]>([]);
    const [typesLoading, setTypesLoading] = useState(false);

    useEffect(() => {
        const loadTypes = async () => {
            setTypesLoading(true);
            try {
                const res = await fetchSurveyTypes();
                setTypes(res.data);
            } catch (e) {
                console.error("Failed to load survey types", e);
            } finally {
                setTypesLoading(false);
            }
        };
        loadTypes();
    }, []);

    const typeOptions = useMemo(() => {
        return types.map(t => ({
            value: t.typeCode,
            label: t.typeName
        }));
    }, [types]);

    useEffect(() => {
        actions.goPage(page);
    }, [page, actions]);

    useEffect(() => {
        if (state.size !== size) actions.setSize(size);
    }, [size, state.size, actions]);

    useEffect(() => {
        actions.setKeyword(keyword);
    }, [keyword, actions]);

    const handleSearch = useCallback(() => {
        setPage(1);
        actions.goPage(1);
        actions.setKeyword(inputKeyword);
    }, [inputKeyword, setPage, actions]);

    const handleEdit = (id: number) => {
        router.push(`/admin/surveys/${id}`);
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        try {
            await deleteSurvey(deleteId);
            toast.success("삭제되었습니다.");
            await actions.reload();
        } catch (e: any) {
            console.error(e);
            toast.error(e.message ?? "삭제 실패");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>설문 통합 관리</h1>

                <div className={styles.searchRow}>
                    <div className={styles.searchGroup}>
                        <div className={styles.dropdownWrap}>
                            <Dropdown
                                value={state.type}
                                options={typeOptions}
                                onChange={(val) => {
                                    setPage(1);
                                    actions.setType(val);
                                }}
                                placeholder="전체 유형"
                                loading={typesLoading}
                            />
                        </div>
                        <div className={styles.searchBarWrap}>
                            <SearchBar
                                value={inputKeyword}
                                onChange={setInputKeyword}
                                onSearch={handleSearch}
                                placeholder="설문 제목 검색"
                            />
                        </div>
                    </div>
                </div>


                <div className={styles.tableWrap}>
                    <SurveysTable
                        items={state.items}
                        loading={state.loading}
                        page={page}
                        size={size}
                        onEditClick={handleEdit}
                        onDeleteClick={(id) => setDeleteId(id)}
                    />
                </div>

                <div className={styles.footerRow}>
                    <PaginationSimple
                        page={page}
                        totalPages={state.meta.totalPages}
                        onChange={setPage}
                        disabled={state.loading}
                    />
                    <Button onClick={() => router.push("/admin/surveys/new")}>
                        새 설문 등록
                    </Button>
                </div>
            </div>

            <ConfirmModal
                open={deleteId !== null}
                title="설문 삭제"
                message="정말 이 설문을 삭제하시겠습니까? 관련 응답 데이터가 모두 삭제됩니다."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                type="danger"
            />
        </div>
    );
}

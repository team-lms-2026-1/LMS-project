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
import { useI18n } from "@/i18n/useI18n";

export default function SurveyListPageClient() {
    const tList = useI18n("survey.admin.list");
    const tTypes = useI18n("survey.common.types");
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
        const typeLabel = (typeCode: string) => {
            if (typeCode === "SATISFACTION") return tTypes("SATISFACTION");
            if (typeCode === "COURSE") return tTypes("COURSE");
            if (typeCode === "SERVICE") return tTypes("SERVICE");
            if (typeCode === "ETC") return tTypes("ETC");
            return typeCode;
        };

        return types.map(t => ({
            value: t.typeCode,
            label: typeLabel(t.typeCode)
        }));
    }, [types, tTypes]);

    useEffect(() => {
        actions.goPage(page);
    }, [page]);

    useEffect(() => {
        if (state.size !== size) actions.setSize(size);
    }, [size]);

    const handleSearch = useCallback(() => {
        setPage(1);
        actions.setKeyword(inputKeyword);
        actions.search();
    }, [inputKeyword, setPage, actions]);

    const handleEdit = (id: number) => {
        router.push(`/admin/surveys/${id}`);
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        try {
            await deleteSurvey(deleteId);
            toast.success(tList("messages.deleteSuccess"));
            await actions.reload();
        } catch (e: any) {
            console.error(e);
            toast.error(e.message ?? tList("messages.deleteFailed"));
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{tList("title")}</h1>

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
                                placeholder={tList("placeholders.typeAll")}
                                loading={typesLoading}
                                className={styles.dropdownFit}
                            />
                        </div>
                        <div className={styles.searchBarWrap}>
                            <SearchBar
                                value={inputKeyword}
                                onChange={setInputKeyword}
                                onSearch={handleSearch}
                                placeholder={tList("placeholders.keyword")}
                                className={styles.searchBarFit}
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
                        {tList("buttons.newSurvey")}
                    </Button>
                </div>
            </div>

            <ConfirmModal
                open={deleteId !== null}
                title={tList("confirmDelete.title")}
                message={tList("confirmDelete.message")}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                type="danger"
            />
        </div>
    );
}


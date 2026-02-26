"use client";

import { useEffect, useState } from "react";
import { fetchMajorForUpdate, updateMajor } from "../../api/departmentsApi";
import { UpdateMajorRequest } from "../../api/types";
import { ToggleSwitch } from "@/components/toggle/ToggleSwitch";
import toast from "react-hot-toast";
import styles from "../../styles/DepartmentModal.module.css";
import { Button } from "@/components/button/Button";
import { Modal } from "@/components/modal/Modal";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    deptId: number;
    majorId: number | null;
    enrolledStudentCount?: number;
    isActive?: boolean;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function MajorUpdateModal({ deptId, majorId, enrolledStudentCount = 0, isActive, open, onClose, onSuccess }: Props) {
    const t = useI18n("authority.departments.modals.majorUpdate");
    const [form, setForm] = useState<UpdateMajorRequest>({
        majorName: "",
        description: "",
        isActive: isActive ?? true,
    });
    const [originalCode, setOriginalCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const hasStudents = enrolledStudentCount > 0;

    useEffect(() => {
        if (open && deptId && majorId) {
            loadMajor();
        }
    }, [open, deptId, majorId]);

    const loadMajor = async () => {
        try {
            setFetching(true);
            const res = await fetchMajorForUpdate(deptId, majorId!);
            const data = res.data;
            const nextIsActive = typeof data.isActive === "boolean" ? data.isActive : (isActive ?? true);
            setForm({
                majorName: data.majorName,
                description: data.description || "",
                isActive: nextIsActive,
            });
            setOriginalCode(data.majorCode);
        } catch (e: any) {
            toast.error(e.message || t("toasts.loadFailed"));
            onClose();
        } finally {
            setFetching(false);
        }
    };

    const handleToggleActive = (checked: boolean) => {
        if (!checked && hasStudents) {
            toast.error(t("validation.cannotDeactivateWithStudents", { count: enrolledStudentCount }));
            return;
        }
        setForm({ ...form, isActive: checked });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!majorId) return;
        if (!form.majorName) {
            toast.error(t("validation.requiredMajorName"));
            return;
        }

        try {
            setLoading(true);
            await updateMajor(deptId, majorId, form);
            toast.success(t("toasts.updateSuccess"));
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || t("toasts.updateFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t("title")}
            footer={
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {t("buttons.cancel")}
                    </Button>
                    {!fetching &&
                        <Button
                            type="submit"
                            form="major-update-form"
                            disabled={loading}
                        >
                            {loading ? t("buttons.saving") : t("buttons.save")}
                        </Button>
                    }
                </div>
            }
        >
            {fetching ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                    {t("loading")}
                </div>
            ) : (
                <form id="major-update-form" onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>{t("fields.majorCode.label")}</label>
                        <input
                            className={styles.input}
                            value={originalCode}
                            disabled
                            style={{ background: '#f3f4f6', color: '#6b7280' }}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            {t("fields.majorName.label")}<span className={styles.required}>*</span>
                        </label>
                        <input
                            className={styles.input}
                            value={form.majorName}
                            onChange={(e) => setForm({ ...form, majorName: e.target.value })}
                            placeholder={t("fields.majorName.placeholder")}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label className={styles.label} style={{ marginBottom: 0 }}>
                                {t("fields.isActive.label")}
                            </label>
                            <ToggleSwitch
                                checked={form.isActive}
                                onChange={handleToggleActive}
                                disabled={hasStudents && form.isActive}
                            />
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {form.isActive ? t("fields.isActive.active") : t("fields.isActive.inactive")}
                            </span>
                        </div>
                        {hasStudents && (
                            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>
                                {t("fields.isActive.studentConstraint", { count: enrolledStudentCount })}
                            </p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{t("fields.description.label")}</label>
                        <textarea
                            className={styles.textarea}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder={t("fields.description.placeholder")}
                            disabled={loading}
                        />
                    </div>
                </form>
            )}
        </Modal>
    );
}
